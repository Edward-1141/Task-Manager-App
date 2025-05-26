import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Task Manager | Profile",
    description:
        "This is Task Manager Profile page",
};

export default function Profile() {
    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7">
                    Profile
                </h3>
                <div className="space-y-6">
                    <UserMetaCard />
                </div>
            </div>
        </div>
    );
}