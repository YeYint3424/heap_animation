"use client";
import { useState, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export default function HeapStepVisualizer() {
  const initialArray = [4, 10, 3, 8, 7, 6, 9];

  // State variables
  const [array, setArray] = useState([...initialArray]);
  const [heapType, setHeapType] = useState("");
  const [active, setActive] = useState([]);
  const [stack, setStack] = useState([]);
  const [heapSize, setHeapSize] = useState(initialArray.length);
  const [message, setMessage] = useState(
    "Click 'Sort Ascending' to see how Max Heap creates ascending order, or 'Sort Descending' to see Min Heap create descending order"
  );
  const [phase, setPhase] = useState("idle");
  const [steps, setSteps] = useState([]); // For tracking step-by-step explanation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto-play functionality
  const [isPlaying, setIsPlaying] = useState(false);
  const delayRef = useRef(1000);
  const [delay, setDelay] = useState(1000);

  // Update delay reference
  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  // Auto-play effect`
  useEffect(() => {
    if (!isPlaying || phase === "idle") return;

    const timer = setTimeout(() => {
      nextStep();
    }, delayRef.current);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, array]);

  const startHeapSort = (type) => {
    setHeapType(type);
    setArray([...initialArray]);
    setHeapSize(initialArray.length);
    setPhase("building");
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSteps([]);

    const n = initialArray.length;
    const startStack = [];

    // Initialize steps array with initial state
    const initialStep = {
      phase: "building",
      message: `Starting ${type === "max" ? "Max Heap Sort" : "Min Heap Sort"}`,
      details: [
        `Starting numbers: [${initialArray.join(", ")}]`,
        `Total numbers to sort: ${n}`,
        `Step 1: Build a ${type === "max" ? "Max Heap" : "Min Heap"}`,
        `${
          type === "max"
            ? "Max Heap = Every parent is bigger than its children"
            : "Min Heap = Every parent is smaller than its children"
        }`,
        `This creates a special tree where the root is always the ${
          type === "max" ? "largest" : "smallest"
        } number`,
      ],
      heapSize: n,
      stack: [],
    };
    setSteps([initialStep]);

    // Start from the last non-leaf node and move up to the root
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      startStack.push(i);
    }
    setStack(startStack);
    setActive([]);

    const heapName = type === "max" ? "Max Heap" : "Min Heap";
    const startMessage = `Step 1: Building the ${heapName}. We start checking from the last parent node (index ${startStack[0]}) and work our way up to the top.`;
    setMessage(startMessage);

    // Add first step explanation
    const step1 = {
      phase: "building",
      message: startMessage,
      details: [
        `📚 What is "Heapify"?`,
        `Heapify means checking if a parent follows the heap rule and swapping if needed`,
        `If parent breaks the rule, we swap it with the ${
          type === "max" ? "largest" : "smallest"
        } child`,
        `We repeat this down the tree until the rule is satisfied everywhere below`,
        `Starting at index ${startStack[0]} (value ${
          initialArray[startStack[0]]
        })`,
      ],
      heapSize: n,
      stack: [...startStack],
    };
    setSteps((prev) => [...prev, step1]);
  };

  const nextStep = () => {
    let arr = [...array];
    let currentStack = [...stack];
    let n = heapSize;
    let stepDetails = [];
    let newMessage = "";

    if (phase === "building") {
      if (currentStack.length === 0) {
        // Heap building complete
        setPhase("sorting");
        const heapName = heapType === "max" ? "Max Heap" : "Min Heap";
        const extreme = heapType === "max" ? "largest" : "smallest";
        newMessage = `✅ Perfect! We've built our ${heapName}. The ${extreme} number ${arr[0]} is now at the top (root). Now we'll sort by taking this ${extreme} number and putting it in the right place.`;
        setMessage(newMessage);

        stepDetails = [
          "✅ Heap building complete!",
          `Our array now forms a perfect ${heapName}`,
          `The top number (index 0) is ${arr[0]} - the ${extreme} in the heap`,
          `Now for the sorting magic:`,
          `1. Take the ${extreme} number from the top`,
          `2. Put it at the end (its final sorted position)`,
          `3. Fix the heap so the next ${extreme} rises to the top`,
          `4. Repeat until all numbers are sorted`,
        ];

        const heapifyStep = {
          phase: "sorting",
          message: newMessage,
          details: stepDetails,
          heapSize: n,
          stack: [0],
        };
        setSteps((prev) => [...prev, heapifyStep]);
        setCurrentStepIndex(steps.length);
        setStack([0]);
        return;
      }

      let i = currentStack[0];
      let target = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      const activeIndices = [i, left, right].filter((idx) => idx < n);
      setActive(activeIndices);

      // Heap type comparison
      const compare = heapType === "max" ? (a, b) => a > b : (a, b) => a < b;
      const comparisonWord = heapType === "max" ? "bigger" : "smaller";

      // Check left child
      if (left < n && compare(arr[left], arr[target])) {
        target = left;
        stepDetails.push(
          `👈 Left child (${arr[left]}) is ${comparisonWord} than parent (${arr[i]})`
        );
      }

      // Check right child
      if (right < n && compare(arr[right], arr[target])) {
        target = right;
        stepDetails.push(
          `👉 Right child (${arr[right]}) is ${comparisonWord} than current ${
            heapType === "max" ? "largest" : "smallest"
          }`
        );
      }

      if (target !== i) {
        // Swap needed
        const heapRule =
          heapType === "max"
            ? "parents must be bigger than children"
            : "parents must be smaller than children";

        const swapReason =
          heapType === "max"
            ? `❌ Problem: Child ${arr[target]} is bigger than parent ${arr[i]}`
            : `❌ Problem: Child ${arr[target]} is smaller than parent ${arr[i]}`;

        newMessage = `Checking position ${i} (${
          arr[i]
        })... ${swapReason}. We need to swap to follow the ${
          heapType === "max" ? "Max" : "Min"
        } Heap rule: ${heapRule}.`;
        setMessage(newMessage);

        stepDetails.push(
          `🔄 Swapping parent ${arr[i]} with child ${arr[target]}`
        );
        stepDetails.push(
          `✅ Now ${arr[target]} is the parent (follows the rule)`
        );
        stepDetails.push(
          `We need to check if ${arr[i]} (now moved down) needs to swap again`
        );

        // Perform swap
        [arr[i], arr[target]] = [arr[target], arr[i]];
        setArray(arr);
        currentStack[0] = target; // Continue heapifying from new position
      } else {
        // No swap needed
        const heapRule = heapType === "max" ? "bigger" : "smaller";
        newMessage = `✅ Good! Position ${i} (${arr[i]}) is already ${heapRule} than both children. No swap needed here.`;
        setMessage(newMessage);

        stepDetails.push(`✅ Position ${i} (${arr[i]}) follows the heap rule`);
        stepDetails.push(`Parent is ${heapRule} than both children ✅`);
        stepDetails.push(`Moving to the next position to check`);
        currentStack.shift(); // Move to next index in stack
      }

      setStack(currentStack);
    } else if (phase === "sorting") {
      if (currentStack.length > 0) {
        // Heapify step during sorting
        let i = currentStack[0];
        let target = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        const compare = heapType === "max" ? (a, b) => a > b : (a, b) => a < b;
        const heapName = heapType === "max" ? "Max Heap" : "Min Heap";

        const activeIndices = [i, left, right].filter((idx) => idx < n);
        setActive(activeIndices);

        // Check children
        if (left < n && compare(arr[left], arr[target])) {
          target = left;
          stepDetails.push(
            `👈 Left child (${arr[left]}) should be at the top based on ${heapName} rule`
          );
        }
        if (right < n && compare(arr[right], arr[target])) {
          target = right;
          stepDetails.push(
            `👉 Right child (${arr[right]}) should be at the top based on ${heapName} rule`
          );
        }

        if (target !== i) {
          // Need to sift down
          newMessage = `After our last swap, we put a smaller number at the top. Now we need to fix the heap by swapping ${arr[i]} down with ${arr[target]}. This is called "sifting down" or "heapify".`;
          setMessage(newMessage);

          stepDetails.push(`🔄 Swapping ${arr[i]} down to position ${target}`);
          stepDetails.push(
            `📚 This is "heapify" in action - fixing the heap after a change`
          );
          stepDetails.push(
            `We'll keep checking/swapping until the heap rule is restored`
          );

          [arr[i], arr[target]] = [arr[target], arr[i]];
          setArray(arr);
          currentStack[0] = target; // Continue heapifying
        } else {
          // Heap property restored
          newMessage = `✅ Perfect! The number ${arr[i]} is now correctly placed. The heap rule is satisfied here.`;
          setMessage(newMessage);

          stepDetails.push(`✅ Heap rule satisfied at position ${i}`);
          stepDetails.push(`No more swaps needed on this path`);
          stepDetails.push(`All good here!`);
          currentStack.shift(); // Done with this heapify
        }
        setStack(currentStack);
      } else if (n > 1) {
        // Extract root and swap with last element
        const lastIdx = n - 1;
        const heapName = heapType === "max" ? "Max Heap" : "Min Heap";
        const extremeValue = heapType === "max" ? "largest" : "smallest";
        const order =
          heapType === "max" ? "smallest to largest" : "largest to smallest";

        newMessage = `🎯 Time to take the ${extremeValue} number! ${arr[0]} is at the top of our ${heapName}. We'll swap it to position ${lastIdx} - this will be its final sorted position for ${order} order!`;
        setMessage(newMessage);

        stepDetails.push(
          `🎯 Step ${array.length - n + 1}: Take the ${extremeValue} number`
        );
        stepDetails.push(
          `Top number (${arr[0]}) is the ${extremeValue} in current heap`
        );
        stepDetails.push(
          `🔄 Swapping ${arr[0]} with the last unsorted number (${arr[lastIdx]})`
        );
        stepDetails.push(`✅ ${arr[0]} now goes to its final sorted position!`);
        stepDetails.push(`We reduced the heap size from ${n} to ${n - 1}`);

        // Swap root with last element
        [arr[0], arr[lastIdx]] = [arr[lastIdx], arr[0]];

        const newSize = n - 1;
        setHeapSize(newSize);
        setArray(arr);
        setStack([0]); // Start heapifying from root
        setActive([0, lastIdx]);

        // Add explanation about what happens next
        stepDetails.push(
          `⚠️ Now the heap is broken (we put ${arr[0]} at the top), so we need to fix it next`
        );
      } else {
        // Sorting complete
        setPhase("idle");
        const sortedOrder =
          heapType === "max"
            ? "ascending (smallest to largest)"
            : "descending (largest to smallest)";
        newMessage = `🎉 🎉 🎉 SORTING COMPLETE! All numbers are in their correct positions. We've sorted them in ${sortedOrder} order using Heap Sort. Great job!`;
        setMessage(newMessage);

        stepDetails.push("🎉 All numbers are now sorted!");
        stepDetails.push(`✅ Final sorted order: [${arr.join(", ")}]`);
        stepDetails.push(
          `⏱️ Time taken: O(n log n) - efficient for large lists`
        );
        stepDetails.push(`💾 Memory used: O(1) - very memory efficient`);
        stepDetails.push(
          `Heap Sort is great because it's always efficient and uses little memory`
        );

        setActive([]);
        setHeapSize(0);
        setIsPlaying(false);
      }
    }

    // Add step to history
    if (stepDetails.length > 0 || newMessage) {
      const newStep = {
        phase,
        message: newMessage || message,
        details: stepDetails,
        heapSize: n,
        stack: [...currentStack],
        array: [...arr],
      };

      setSteps((prev) => {
        const newSteps = [...prev, newStep];
        setCurrentStepIndex(newSteps.length - 1);
        return newSteps;
      });
    }
  };

  const togglePlayPause = () => {
    if (phase === "idle") return;
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setArray([...initialArray]);
    setHeapType("");
    setActive([]);
    setStack([]);
    setHeapSize(initialArray.length);
    setPhase("idle");
    setMessage(
      "Click 'Sort Ascending' to see how Max Heap creates ascending order, or 'Sort Descending' to see Min Heap create descending order"
    );
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
  };

  const navigateStep = (direction) => {
    if (direction === "prev" && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      const step = steps[currentStepIndex - 1];
      setMessage(step.message);
    } else if (direction === "next" && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      const step = steps[currentStepIndex + 1];
      setMessage(step.message);
    }
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">
        Heap Sort Visualizer - Watch How Sorting Works!
      </h1>

      {/* Status Panel */}
      <div className="bg-blue-900 p-4 rounded-lg mb-6 shadow border border-blue-200">
        <p className="mb-2">
          <b>What&apos;s happening now:</b> {message}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-blue-900 px-2 py-1 rounded">
            <b>Phase:</b>{" "}
            {phase === "building"
              ? "Building the Heap"
              : phase === "sorting"
              ? "Sorting Numbers"
              : "Ready to Start"}
          </div>
          <div className="bg-green-900 px-2 py-1 rounded">
            <b>Heap Type:</b>{" "}
            {heapType === "max"
              ? "Max Heap → Creates Ascending Order"
              : heapType === "min"
              ? "Min Heap → Creates Descending Order"
              : "Choose one to start"}
          </div>
          <div className="bg-yellow-900 px-2 py-1 rounded">
            <b>Heap Size:</b> {heapSize} unsorted numbers left
          </div>
          <div className="bg-purple-900 px-2 py-1 rounded">
            <b>Step:</b> {currentStepIndex + 1} of {Math.max(steps.length, 1)}
          </div>
        </div>
      </div>

      {/* Visual Array */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Numbers Visualization</h2>
        <p className="text-gray-600 mb-3 text-sm">
          Each box shows a number and its position. Colors tell you what&apos;s
          happening:
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {array.map((value, i) => (
            <div
              key={i}
              className="relative transition-all duration-300"
              style={{ width: 100 }}
            >
              <div
                className={`
                  flex flex-col items-center justify-center
                  rounded-lg shadow-md
                  ${
                    i >= heapSize
                      ? "bg-green-500 text-white" // Sorted
                      : active.includes(i)
                      ? "bg-red-500 text-white" // Active
                      : "bg-blue-500 text-white" // Unsorted
                  }
                `}
                style={{
                  height: 60,
                  opacity: i >= heapSize ? 0.8 : 1,
                }}
              >
                <span className="text-xl font-bold">{value}</span>
                <span className="text-xs mt-1">position {i}</span>
              </div>
              {/* Binary tree position indicators */}
              <div className="text-center text-xs text-gray-600 mt-1">
                {i === 0
                  ? "🌳 Top (Root)"
                  : i < heapSize
                  ? `Parent position: ${Math.floor((i - 1) / 2)}`
                  : "✅ Sorted & Final"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Explanation */}
      <div className="mb-8 bg-gray-900 border border-gray-300 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3 flex items-center justify-between">
          <span>Step-by-Step Explanation</span>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            Step {currentStepIndex + 1} of {Math.max(steps.length, 1)}
          </span>
        </h2>

        {steps.length > 0 && steps[currentStepIndex] ? (
          <div>
            <div className="mb-3 p-3 bg-blue-900 rounded border-l-4 border-blue-500">
              <p className="font-medium">{steps[currentStepIndex].message}</p>
            </div>
            <ul className="space-y-2">
              {steps[currentStepIndex].details.map((detail, idx) => (
                <li key={idx} className="flex items-start p-2 rounded">
                  <span className="inline-block w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-center mr-2 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">
            Click &quot;Sort Ascending&quot; or &quot;Sort Descending&quot; to
            start watching how Heap Sort works!
          </div>
        )}

        {/* Step Navigation */}
        {/* <div className="flex justify-between mt-4">
          <button
            onClick={() => navigateStep("prev")}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← See Previous Step
          </button>
          <button
            onClick={() => navigateStep("next")}
            disabled={currentStepIndex >= steps.length - 1}
            className="px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            See Next Step →
          </button>
        </div> */}
      </div>

      {/* Controls */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Controls</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            className={twMerge(
              "px-4 py-2 rounded font-medium transition",
              heapType !== "min" && phase === "idle"
                ? "bg-green-600 hover:bg-green-700 text-white shadow"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            )}
            onClick={() => startHeapSort("max")}
            disabled={phase !== "idle"}
          >
            Sort Ascending (Max Heap)
          </button>
          <button
            className={twMerge(
              "px-4 py-2 rounded font-medium transition",
              heapType !== "max" && phase === "idle"
                ? "bg-green-600 hover:bg-green-700 text-white shadow"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            )}
            onClick={() => startHeapSort("min")}
            disabled={phase !== "idle"}
          >
            Sort Descending (Min Heap)
          </button>
          <button
            onClick={nextStep}
            className={twMerge(
              "px-4 py-2 rounded font-medium transition",
              heapType === ""
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow"
            )}
            disabled={heapType === ""}
          >
            Next Step ▶
          </button>
          <button
            onClick={togglePlayPause}
            className={twMerge(
              "px-4 py-2 rounded font-medium transition",
              heapType === "" || phase === "idle"
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isPlaying
                ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow"
            )}
            disabled={heapType === "" || phase === "idle"}
          >
            {isPlaying ? "⏸️ Pause Auto-play" : "▶️ Start Auto-play"}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
            onClick={reset}
          >
            Start Over
          </button>
        </div>

        {/* Speed Control */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Animation Speed: {delay}ms per step
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="w-full max-w-md"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Faster</span>
            <span>Slower</span>
          </div>
        </div>
      </div>

      {/* What is Heapify Section */}
      <div className="mb-6 p-4 bg-purple-900 rounded-lg border border-purple-200">
        <h2 className="text-lg font-semibold mb-3 text-white">
          📚 What is &quot;Heapify&quot;?
        </h2>
        <div className="text-sm space-y-3">
          <p>
            <b>Heapify is the core operation of Heap Sort</b> - it&apos;s how we
            maintain the heap structure.
          </p>
          <div className="bg-white text-purple-900 p-3 rounded border">
            <p className="font-medium mb-1">📖 Simple Definition:</p>
            <p>
              &quot;Heapify&quot; means checking if a parent follows the heap
              rule and swapping with a child if needed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white text-purple-900 p-3 rounded border">
              <p className="font-medium mb-1">🔄 How Heapify Works:</p>
              <ul className="space-y-1">
                <li>1. Look at a parent and its two children</li>
                <li>2. Check if parent follows the heap rule</li>
                <li>3. If not, swap with the &quot;extreme&quot; child</li>
                <li>4. Repeat with the moved element</li>
                <li>5. Stop when rule is satisfied</li>
              </ul>
            </div>
            <div className="bg-white text-purple-900 p-3 rounded border">
              <p className="font-medium mb-1">🎯 Why We Heapify:</p>
              <ul className="space-y-1">
                <li>• To fix the heap after changes</li>
                <li>• To bring largest/smallest to top</li>
                <li>• To maintain heap structure</li>
                <li>• To enable efficient sorting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Information */}
    </div>
  );
}
