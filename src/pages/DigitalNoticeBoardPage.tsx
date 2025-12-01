import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoticeFeed from "@/components/DigitalNoticeBoard/NoticeFeed";

const DigitalNoticeBoardPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => navigate('/other-information')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Digital Notice Board</h1>
                </div>

                <NoticeFeed isAdmin={false} />
            </div>
        </div>
    );
};

export default DigitalNoticeBoardPage;
