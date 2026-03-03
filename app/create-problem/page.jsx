import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserRole } from "@/lib/generated/prisma/enums";
import { currentUserRole } from "@/modules/auth/actions";
import CreateProblemForm from "@/modules/problems/component/create-problem-form";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const CreateProblemPage = async () => {
  const user = await currentUser();
  const userRole = await currentUserRole();
  if (userRole !== UserRole.ADMIN) {
    return redirect("/");
  }
  return (
    <section className="flex flex-col items-center justify-center container my-4 w-screen mx-auto">
      <div className="flex flex-row justify-between items-center w-full">
        <Link href={"/"}>
          <Button variant={"outline"} size={"icon"}>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-amber-400">
          Welcome {user?.firstName}! Create a Problem
        </h1>
        <ModeToggle />
      </div>
      <CreateProblemForm />
    </section>
  );
};

export default CreateProblemPage;
