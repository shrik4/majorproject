import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateNoticeForm from "@/components/DigitalNoticeBoard/CreateNoticeForm";
import NoticeFeed from "@/components/DigitalNoticeBoard/NoticeFeed";

const DigitalNoticeBoardAdminPage = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleNoticeCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Digital Notice Board Admin</h1>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <CreateNoticeForm onNoticeCreated={handleNoticeCreated} />
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <NoticeFeed isAdmin={true} refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalNoticeBoardAdminPage;
