"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() { 
  const { session, setProfileStatus } = useFinSyncSession();
  const router = useRouter();

  if (session?.profile_status === "completed") {
    return (
      <div className="mx-auto w-full max-w-2xl py-10">
        <header className="mb-8 text-center">
          <p className="eyebrow text-emerald-400">Profile already saved</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your financial profile has been completed</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Your information is securely saved and is being used for your financial analysis.</p>
        </header>
        
        <div className="flex flex-col gap-4 items-center mt-10">
          <Link href="/profile/review" className="primary-button w-full sm:w-auto text-center px-10">
            View Profile
          </Link>
          <button 
            onClick={() => {
              if (confirm("Your profile is already saved. Do you want to edit your financial profile?")) {
                setProfileStatus("editing");
                router.push("/profile?step=0"); // Start editing from step 0 (but it will be pre-filled)
              }
            }}
            className="secondary-button w-full sm:w-auto text-center px-10"
          >
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return <OnboardingForm />; 
}
