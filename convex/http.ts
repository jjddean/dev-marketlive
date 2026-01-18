import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { transformWebhookData } from "./paymentAttemptTypes";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch ((event as any).type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data as any,
        });
        break;

      case "user.deleted": {
        const clerkUserId = (event.data as any).id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }

      case "paymentAttempt.updated": {
        const paymentAttemptData = transformWebhookData((event as any).data);
        await ctx.runMutation(internal.paymentAttempts.savePaymentAttempt, {
          paymentAttemptData,
        });
        break;
      }

      // Organization events - sync to Convex
      case "organization.created":
      case "organization.updated":
        await ctx.runMutation(internal.organizations.upsertFromClerk, {
          data: event.data as any,
        });
        break;

      case "organization.deleted": {
        const clerkOrgId = (event.data as any).id!;
        await ctx.runMutation(internal.organizations.deleteFromClerk, { clerkOrgId });
        break;
      }

      // Organization membership events - update user's org
      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const memberData = event.data as any;
        await ctx.runMutation(internal.organizations.updateUserOrgMembership, {
          clerkUserId: memberData.public_user_data?.user_id,
          clerkOrgId: memberData.organization?.id,
          role: memberData.role,
        });
        break;
      }

      case "organizationMembership.deleted": {
        const memberData = event.data as any;
        await ctx.runMutation(internal.organizations.updateUserOrgMembership, {
          clerkUserId: memberData.public_user_data?.user_id,
          clerkOrgId: undefined, // Remove org association
          role: undefined,
        });
        break;
      }

      default:
        console.log("Ignored webhook event", (event as any).type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;