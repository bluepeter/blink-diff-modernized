import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { spawn } from "bun";
import fs from "fs";
import path from "path";

const CLI_PATH = path.join(import.meta.dir, "..", "bin", "blink-diff2");
const TEST_IMAGE_1 = path.join(import.meta.dir, "test1.png");
const TEST_IMAGE_2 = path.join(import.meta.dir, "test2.png");

async function runCLI(args) {
	const proc = spawn([CLI_PATH, ...args], {
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	return {
		code: exitCode,
		stdout: stdout || "",
		stderr: stderr || "",
	};
}

describe("CLI Arguments", () => {
	const tempOutput = path.join(import.meta.dir, "cli-test-output.png");

	afterEach(() => {
		// Clean up temp output file
		if (fs.existsSync(tempOutput)) {
			fs.unlinkSync(tempOutput);
		}
	});

	describe("Basic usage", () => {
		it("should show help with no arguments", async () => {
			const result = await runCLI([]);
			expect(result.code).toBe(1);
			expect(result.stdout).toContain("Usage: blink-diff");
		});

		it("should accept two image paths", async () => {
			const result = await runCLI([TEST_IMAGE_1, TEST_IMAGE_2]);
			expect(result.code).toBe(0);
		});

		it("should print help with --help", async () => {
			const result = await runCLI(["--help"]);
			expect(result.code).toBe(0);
			expect(result.stdout).toContain("Usage: blink-diff");
			expect(result.stdout).toContain("Options:");
		});

		it("should print version with --version", async () => {
			const result = await runCLI(["--version"]);
			expect(result.code).toBe(0);
			expect(result.stdout).toContain("Blink-Diff");
		});
	});

	describe("--verbose", () => {
		it("should enable verbose output", async () => {
			const result = await runCLI([
				"--verbose",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(result.stdout).toContain("Time:");
			expect(result.stdout).toContain("PASS");
		});
	});

	describe("--debug", () => {
		it("should enable debug mode", async () => {
			const result = await runCLI([
				"--debug",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			// Debug mode should still produce output
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--threshold", () => {
		it("should accept a threshold value", async () => {
			const result = await runCLI([
				"--threshold",
				"100",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should reject negative threshold", async () => {
			const result = await runCLI([
				"--threshold",
				"-10",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain("must be positive");
		});

		it("should accept decimal threshold", async () => {
			const result = await runCLI([
				"--threshold",
				"0.01",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});
	});

	describe("--threshold-type", () => {
		it("should accept 'pixel' type", async () => {
			const result = await runCLI([
				"--threshold-type",
				"pixel",
				"--threshold",
				"100",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should accept 'percent' type", async () => {
			const result = await runCLI([
				"--threshold-type",
				"percent",
				"--threshold",
				"0.01",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should reject invalid threshold type", async () => {
			const result = await runCLI([
				"--threshold-type",
				"invalid",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain("can be either 'pixel' or 'percent'");
		});
	});

	describe("--delta", () => {
		it("should accept a delta value", async () => {
			const result = await runCLI([
				"--delta",
				"50",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should reject negative delta", async () => {
			const result = await runCLI([
				"--delta",
				"-10",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain("must be positive");
		});
	});

	describe("--copyImageA", () => {
		it("should copy image A to output", async () => {
			const result = await runCLI([
				"--copyImageA",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--copyImageB", () => {
		it("should copy image B to output", async () => {
			const result = await runCLI([
				"--copyImageB",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--no-copy", () => {
		it("should not copy any image to output", async () => {
			const result = await runCLI([
				"--no-copy",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--output", () => {
		it("should write output to specified file", async () => {
			const result = await runCLI([
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--filter", () => {
		it("should accept a single filter", async () => {
			const result = await runCLI([
				"--filter",
				"grayScale",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should accept multiple filters", async () => {
			const result = await runCLI([
				"--filter",
				"grayScale,luma",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});
	});

	describe("--no-composition", () => {
		it("should disable composition", async () => {
			const result = await runCLI([
				"--no-composition",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--compose-ltr", () => {
		it("should compose left to right", async () => {
			const result = await runCLI([
				"--compose-ltr",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--compose-ttb", () => {
		it("should compose top to bottom", async () => {
			const result = await runCLI([
				"--compose-ttb",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});

	describe("--hide-shift", () => {
		it("should hide shift highlighting", async () => {
			const result = await runCLI([
				"--hide-shift",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});
	});

	describe("--h-shift", () => {
		it("should accept horizontal shift value", async () => {
			const result = await runCLI([
				"--h-shift",
				"5",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should reject negative h-shift", async () => {
			const result = await runCLI([
				"--h-shift",
				"-5",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain("must be positive");
		});
	});

	describe("--v-shift", () => {
		it("should accept vertical shift value", async () => {
			const result = await runCLI([
				"--v-shift",
				"5",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should reject negative v-shift", async () => {
			const result = await runCLI([
				"--v-shift",
				"-5",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain("must be positive");
		});
	});

	describe("--block-out", () => {
		it("should accept a single block-out area", async () => {
			const result = await runCLI([
				"--block-out",
				"0,0,1,1",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should accept multiple block-out areas", async () => {
			const result = await runCLI([
				"--block-out",
				"0,0,1,1",
				"--block-out",
				"1,1,1,1",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
		});

		it("should require at least x and y coordinates", async () => {
			const result = await runCLI([
				"--block-out",
				"10",
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(1);
			expect(result.stdout + result.stderr).toContain(
				"should at least have the x and y coordinate"
			);
		});
	});

	describe("Combined arguments", () => {
		it("should work with multiple arguments", async () => {
			const result = await runCLI([
				"--verbose",
				"--threshold",
				"100",
				"--threshold-type",
				"pixel",
				"--delta",
				"30",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});

		it("should handle complex argument combinations", async () => {
			const result = await runCLI([
				"--verbose",
				"--debug",
				"--threshold",
				"0.01",
				"--threshold-type",
				"percent",
				"--delta",
				"50",
				"--h-shift",
				"3",
				"--v-shift",
				"3",
				"--filter",
				"grayScale,luma",
				"--block-out",
				"10,20,30,40",
				"--compose-ltr",
				"--output",
				tempOutput,
				TEST_IMAGE_1,
				TEST_IMAGE_2,
			]);
			expect(result.code).toBe(0);
			expect(fs.existsSync(tempOutput)).toBe(true);
		});
	});
});

