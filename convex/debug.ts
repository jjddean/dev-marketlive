import { query } from "./_generated/server";

export const getIdentity = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        return identity;
    },
});
