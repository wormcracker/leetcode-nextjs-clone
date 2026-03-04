import { db } from "@/lib/db";
import { getAllProblems } from "@/modules/problems/actions";
import ProblemTable from "@/modules/problems/component/problem-table";
import { currentUser } from "@clerk/nextjs/server";

const ProblemPage = async () => {
  const user = await currentUser();
  let dbUser = null;
  if (user) {
    dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    });
  }
  const { data: problems, error } = await getAllProblems();
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error Loading problems: {error}</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-32">
      <ProblemTable problems={problems} user={dbUser} />
    </div>
  );
};

export default ProblemPage;
