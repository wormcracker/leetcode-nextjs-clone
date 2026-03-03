import { db } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "@/lib/judge0";
import { currentUserRole, getCurrentUser } from "@/modules/auth/actions";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // TODO:
    // Get all the field from the clientside
    // Basic Validations
    // Run a loop for each language ---> number of testcases
    // // Use judge0 lang Id
    // // Prepare judge0 submission for all testcase
    // // Submit all the test cases in one batch
    // // extract tokens from db
    // // If all pased save in db

    const userRole = await currentUserRole();

    const user = await getCurrentUser();
    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = body;

    // validate input
    if (
      !title ||
      !description ||
      !difficulty ||
      !tags ||
      !examples ||
      !constraints ||
      !testCases ||
      !codeSnippets ||
      !referenceSolutions
    ) {
      return NextResponse.json(
        { error: "Missing Required fields" },
        { status: 400 },
      );
    }

    // validate test cases
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required" },
        { status: 400 },
      );
    }

    // validate reference solution
    if (!referenceSolutions || typeof referenceSolutions !== "object") {
      return NextResponse.json(
        { error: "At least one test case is required" },
        { status: 400 },
      );
    }

    //langugage: key, solutionCode: Value from referenceSolutions: object
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      // Get judge0 language ID for the current lang
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return NextResponse.json(
          { error: `Unsupported language: ${language}` },
          { status: 400 },
        );
      }

      // prepare judge0 submission for all the testcases
      const submissions = testCases.map((input, output) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      // submit all testcases in one batch
      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return NextResponse.json(
            {
              error: `Validation failed for ${language}`,
              testCase: {
                input: submissions[i].stdin,
                expectedOutput: submissions[i].expected_output,
                actualOutput: result.stdout,
                error: result.stderr || result.compile_output,
              },
              details: result,
            },
            { status: 400 },
          );
        }
      }
    }

    // save the problem into db
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Problem created successfully",
        data: newProblem,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to save problem to database",
      },
      { status: 500 },
    );
  }
}
