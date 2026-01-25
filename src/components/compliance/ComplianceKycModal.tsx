import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CheckCircle, Upload, ShieldCheck, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

interface KycModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ComplianceKycModal = ({ open, onOpenChange }: KycModalProps) => {
    const [step, setStep] = useState(1);
    const [kycId, setKycId] = useState<Id<"kycVerifications"> | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);

    // Mutations
    const startKyc = useMutation(api.compliance.startKyc);
    const updateDetails = useMutation(api.compliance.updateKycDetails);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const addDocument = useMutation(api.compliance.addKycDocument);
    const submitKyc = useMutation(api.compliance.submitKyc);

    // Queries
    const status = useQuery(api.compliance.getKycStatus);

    // Initialize or Resume
    useEffect(() => {
        if (open && status) {
            setKycId(status._id);
            if (status.status === 'submitted' || status.status === 'verified') {
                setStep(4); // Show success/status
            } else {
                setStep(status.step || 1);
            }
        } else if (open && !status && !kycId) {
            // New draft
            startKyc({}).then((id) => setKycId(id));
        }
    }, [open, status]);

    // Step 1 Form Data
    const [formData, setFormData] = useState({
        companyName: "",
        registrationNumber: "",
        vatNumber: "",
        country: "United Kingdom"
    });

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Custom Validation
        if (!formData.companyName.trim() || !formData.registrationNumber.trim()) {
            toast.error("Please fill in all required fields", {
                description: "Company Name and Registration Number are mandatory."
            });
            return;
        }

        if (!kycId) return;
        setLoading(true);
        try {
            await updateDetails({
                id: kycId,
                ...formData
            });
            setStep(2);
        } catch (error) {
            toast.error("Failed to save details");
        } finally {
            setLoading(false);
        }
    };

    // Step 2 File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file || !kycId) return;

        setLoading(true);
        try {
            // 1. Get URL
            const postUrl = await generateUploadUrl();
            // 2. Upload
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            // 3. Save Ref
            await addDocument({
                id: kycId,
                type,
                fileUrl: storageId, // Using storageId as URL for now, will resolve on read
                fileId: storageId
            });

            setUploadedCount(prev => prev + 1);
            toast.success("Document uploaded");
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!kycId) return;
        setLoading(true);
        try {
            await submitKyc({ id: kycId });
            setStep(3); // Pending Review Screen
            toast.success("KYC Submitted Successfully");
        } catch (error) {
            toast.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        Identity Verification (KYC)
                    </DialogTitle>
                    <DialogDescription>
                        Complete the following steps to verify your business identity for international shipping.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
                        style={{ width: `${step === 4 ? 100 : ((step - 1) / 3) * 100}%` }}
                    />
                </div>

                {/* STEP 1: Details */}
                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Acme Logistics Ltd"
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country of Registration</Label>
                                <Input
                                    defaultValue="United Kingdom"
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration Number (CRN) <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="12345678"
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>VAT Number (Optional)</Label>
                                <Input
                                    placeholder="GB 123 4567 89"
                                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </div>
                    </form>
                )}

                {/* STEP 2: Uploads */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                            Please upload clear copies of the following documents. These will be reviewed by our compliance team.
                        </div>

                        <div className="space-y-4">
                            <div className="border rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Certificate of Incorporation</p>
                                        <p className="text-xs text-gray-500">PDF or JPEG, max 5MB</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'incorporation_cert')}
                                    />
                                    <Button variant="outline" size="sm">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Director ID / Passport</p>
                                        <p className="text-xs text-gray-500">Government issued ID</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'id_proof')}
                                    />
                                    <Button variant="outline" size="sm">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleFinalSubmit} disabled={loading || (uploadedCount === 0 && (!status?.documents?.length))}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit for Review
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3/4: Success/Status */}
                {(step === 3 || step === 4) && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {status?.status === 'verified' ? (
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                            ) : (
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {status?.status === 'verified' ? "Verification Complete" : "Submission Received"}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {status?.status === 'verified'
                                ? "Your account is fully verified for international trading."
                                : "Your documents are currently under review by our compliance team. You will be notified once approved (typically 24-48h)."
                            }
                        </p>
                        <Button onClick={() => {
                            onOpenChange(false);
                            window.location.reload(); // Force reload to update dashboard state
                        }}>
                            Close
                        </Button>
                        <Button variant="ghost" className="ml-2" onClick={() => {
                            setStep(1);
                            setKycId(null);
                            setFormData({
                                companyName: "",
                                registrationNumber: "",
                                vatNumber: "",
                                country: "United Kingdom"
                            });
                            // Ideally we would also clear backend state if this is for testing, 
                            // but for UI flow reset this is sufficient to show the form again.
                            // In a real app we might not want this, but user requested it.
                        }}>
                            Submit Another (Test)
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
