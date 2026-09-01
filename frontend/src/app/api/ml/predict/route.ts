import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { extractMLPipelineFeatures } from "@/lib/financial/ml-features";

function resolveMLPaths() {
  const venvPythonRel = process.platform === "win32"
    ? path.join("ml_pipeline", "venv", "Scripts", "python.exe")
    : path.join("ml_pipeline", "venv", "bin", "python");
  const scriptRel = path.join("ml_pipeline", "src", "predict_cli.py");

  // Candidates for project root: process.cwd() and parent directories
  let curr = process.cwd();
  const candidates: string[] = [];
  for (let i = 0; i < 5; i++) {
    candidates.push(curr);
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  for (const dir of candidates) {
    const py = path.join(dir, venvPythonRel);
    const script = path.join(dir, scriptRel);
    if (fs.existsSync(py) && fs.existsSync(script)) {
      return { pythonPath: py, scriptPath: script };
    }
  }

  // Fallback to process.cwd() relative
  return {
    pythonPath: path.resolve(process.cwd(), venvPythonRel),
    scriptPath: path.resolve(process.cwd(), scriptRel),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, goals } = body || {};

    if (!profile) {
      return NextResponse.json(
        { error: "Missing financial profile in request body" },
        { status: 400 }
      );
    }

    // Extract features on the backend
    const features = extractMLPipelineFeatures(profile, goals || null);

    const { pythonPath, scriptPath } = resolveMLPaths();

    // Diagnostic logging
    console.log("[ML API] Resolved pythonPath:", pythonPath);
    console.log("[ML API] Resolved scriptPath:", scriptPath);

    if (!fs.existsSync(pythonPath)) {
      console.error(`[ML API] Python executable not found at ${pythonPath}`);
      return NextResponse.json(
        {
          error: "Python executable not found",
          details: `Resolved pythonPath does not exist: ${pythonPath}`,
        },
        { status: 500 }
      );
    }

    if (!fs.existsSync(scriptPath)) {
      console.error(`[ML API] Predict CLI script not found at ${scriptPath}`);
      return NextResponse.json(
        {
          error: "ML script not found",
          details: `Resolved scriptPath does not exist: ${scriptPath}`,
        },
        { status: 500 }
      );
    }

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve, reject) => {
      const child = spawn(pythonPath, [scriptPath]);
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });

      child.on("error", (err) => {
        reject(err);
      });

      child.stdin.write(JSON.stringify(features));
      child.stdin.end();
    });

    console.log("[ML API] Python exit code:", result.exitCode);
    console.log("[ML API] Python stderr:", result.stderr);

    if (result.exitCode !== 0) {
      return NextResponse.json(
        {
          error: `Python process exited with code ${result.exitCode}`,
          stderr: result.stderr,
          stdout: result.stdout,
        },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(result.stdout);
    } catch (parseErr: any) {
      return NextResponse.json(
        {
          error: "Failed to parse Python CLI output as JSON",
          details: parseErr.message,
          stdout: result.stdout,
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    if (parsedResult.error) {
      return NextResponse.json(
        {
          error: parsedResult.error,
          stderr: result.stderr,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ml_risk_profile: parsedResult
    });

  } catch (error: any) {
    console.error("ML Prediction Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate ML risk profile",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

