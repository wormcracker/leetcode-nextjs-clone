"use server";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getAllProblems = async () => {
  try {
    const user = await currentUser();
    const data = await db.user.findUnique({
      where: {
        clerkId: user?.id,
      },
      select: {
        id: true,
      },
    });
    if (!data) {
      throw new Error("User not found in DB");
    }
    const problems = await db.problem.findMany({
      include: {
        solvedBy: {
          where: {
            userId: data?.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: problems };
  } catch (error) {
    return { success: false, error: "Failed to fetch problems" };
  }
};

export const getProblemById = async (id) => {
  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });
    if (!problem) {
      throw new Error("No problem found with this id");
    }
    return { success: true, data: problem };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch problems",
    };
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });
    if (dbUser?.role !== UserRole.ADMIN) {
      throw new Error("Only admins can delete problem");
    }
    await db.problem.delete({
      where: { id: problemId },
    });
    revalidatePath("/problems");
    return { success: true, message: "Problem deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to delete problems",
    };
  }
};

export const executeCode = async (
  source_code,
  language_id,
  stdin,
  expected_outputs,
  id,
) => {
  const user = await currentUser();

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (
    !Array.isArray(stdin) ||
    stdin.length === 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    return { success: false, error: "Invalid test cases" };
  }

  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
    base64_encoded: false,
    wait: false,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((res) => res.token);

  const results = await pollBatchResults(tokens);

  let allPassed = true;
  const detailedResults = results.map((result, i) => {
    const stdout = result.stdout?.trim() || null;
    const expected_output = expected_outputs[i]?.trim();
    const passed = stdout === expected_output;

    if (!passed) allPassed = false;

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected: expected_output,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : undefined,
    };
  });

  const submission = await db.submission.create({
    data: {
      userId: dbUser.id,
      problemId: id,
      sourceCode: source_code,
      language: getLanguageName(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
      stderr: detailedResults.some((r) => r.stderr)
        ? JSON.stringify(detailedResults.map((r) => r.stderr))
        : null,
      compileOutput: detailedResults.some((r) => r.compile_output)
        ? JSON.stringify(detailedResults.map((r) => r.compile_output))
        : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      memory: detailedResults.some((r) => r.memory)
        ? JSON.stringify(detailedResults.map((r) => r.memory))
        : null,
      time: detailedResults.some((r) => r.time)
        ? JSON.stringify(detailedResults.map((r) => r.time))
        : null,
    },
  });

  // 7. Mark problem as solved if all test cases passed
  if (allPassed) {
    await db.problemSolved.upsert({
      where: {
        userId_problemId: { userId: dbUser.id, problemId: id },
      },
      update: {},
      create: { userId: dbUser.id, problemId: id },
    });
  }

  const testCaseResults = detailedResults.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expected: result.expected,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    status: result.status,
    memory: result.memory,
    time: result.time,
  }));

  await db.testCaseResult.createMany({ data: testCaseResults });

  const submissionWithTestCases = await db.submission.findUnique({
    where: { id: submission.id },
    include: { testCases: true },
  });

  return { success: true, submission: submissionWithTestCases };
};

export const getAllSubmissionByCurrentUserForProblem = async (problemId) => {
  const user = await currentUser();
  const userId = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      id: true,
    },
  });
  const submissions = await db.submission.findMany({
    where: {
      problemId: problemId,
      userId: userId.id,
    },
  });
  return { success: true, data: submissions };
};
