"use client";
import { useState } from "react";

export default function HeapStepVisualizer() {
  const initialArray = [4, 10, 3, 5, 1, 2, 8, 7, 6, 9];

  const [array, setArray] = useState([...initialArray]);
  const [heapType, setHeapType] = useState("");
  const [active, setActive] = useState([]);
  const [stack, setStack] = useState([]);
  const [heapSize, setHeapSize] = useState(initialArray.length); // Tracks unsorted portion
  const [message, setMessage] = useState(
    "Choose Max Heap or Min Heap to start sorting"
  );
  const [phase, setPhase] = useState("idle"); // 'idle', 'building', 'sorting'

  const startHeapSort = (type) => {
    setHeapType(type);
    setArray([...initialArray]);
    setHeapSize(initialArray.length);
    setPhase("building");

    const n = initialArray.length;
    const startStack = [];
    // Start from the last non-leaf node and move up to the root
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      startStack.push(i);
    }
    setStack(startStack);
    setActive([]);
    setMessage(
      `Phase 1: Building ${
        type === "max" ? "Max" : "Min"
      } Heap. Starting from index ${startStack[0]} (last non-leaf node).`
    );
  };

  const nextStep = () => {
    let arr = [...array];
    let currentStack = [...stack];
    let n = heapSize;

    if (phase === "building") {
      if (currentStack.length === 0) {
        setPhase("sorting");
        setMessage(
          "Heap structure complete! Phase 2: Swapping root to the end to sort."
        );
        return;
      }

      let i = currentStack[0];
      let target = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      // Logic for picking the child to swap with
      if (
        left < n &&
        (heapType === "max" ? arr[left] > arr[target] : arr[left] < arr[target])
      )
        target = left;
      if (
        right < n &&
        (heapType === "max"
          ? arr[right] > arr[target]
          : arr[right] < arr[target])
      )
        target = right;

      setActive([i, left, right].filter((idx) => idx < n));

      if (target !== i) {
        const reason =
          heapType === "max"
            ? `Child ${arr[target]} is larger than parent ${arr[i]}`
            : `Child ${arr[target]} is smaller than parent ${arr[i]}`;

        setMessage(`Swap: ${reason}. Sifting ${arr[i]} down.`);
        [arr[i], arr[target]] = [arr[target], arr[i]];
        setArray(arr);
        currentStack[0] = target;
      } else {
        setMessage(
          `Index ${i} (${arr[i]}) already satisfies the ${heapType} heap property relative to its children.`
        );
        currentStack.shift();
      }
      setStack(currentStack);
    } else if (phase === "sorting") {
      if (currentStack.length > 0) {
        let i = currentStack[0];
        let target = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (
          left < n &&
          (heapType === "max"
            ? arr[left] > arr[target]
            : arr[left] < arr[target])
        )
          target = left;
        if (
          right < n &&
          (heapType === "max"
            ? arr[right] > arr[target]
            : arr[right] < arr[target])
        )
          target = right;

        setActive([i, left, right].filter((idx) => idx < n));

        if (target !== i) {
          setMessage(
            `Sifting down: Moving ${arr[i]} deeper to restore heap property.`
          );
          [arr[i], arr[target]] = [arr[target], arr[i]];
          setArray(arr);
          currentStack[0] = target;
        } else {
          setMessage(
            `Heap property restored at root. Ready for next extraction.`
          );
          currentStack.shift();
        }
        setStack(currentStack);
      } else if (n > 1) {
        const lastIdx = n - 1;
        const extremeValue = heapType === "max" ? "largest" : "smallest";
        setMessage(
          `EXTRACT: Moving ${extremeValue} element (${arr[0]}) to index ${lastIdx} (final sorted position).`
        );
        [arr[0], arr[lastIdx]] = [arr[lastIdx], arr[0]];

        const newSize = n - 1;
        setHeapSize(newSize);
        setArray(arr);
        setStack([0]);
        setActive([0, lastIdx]);
      } else {
        setPhase("idle");
        setMessage("✅ Success: Array is fully sorted!");
        setActive([]);
        setHeapSize(0); // Mark last element as sorted/green
      }
    }
  };

  const reset = () => {
    setArray([...initialArray]);
    setHeapType("");
    setActive([]);
    setStack([]);
    setHeapSize(initialArray.length);
    setPhase("idle");
    setMessage("Choose Max Heap or Min Heap to start sorting");
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>Heap Sort Visualizer</h1>

      <div
        style={{
          background: "#cccc",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <p>
          <b>Status:</b> {message}
        </p>
        <p>
          <b>Indices to check:</b>{" "}
          {stack.length > 0 ? stack.join(", ") : "None"}
        </p>
        <p>
          <b>Heap Size:</b> {heapSize} / {array.length}
        </p>
      </div>

      <div
        style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}
      >
        {array.map((value, i) => (
          <div
            key={i}
            style={{
              width: 50,
              height: 50,
              background:
                i >= heapSize
                  ? "#10b981" // Green for sorted
                  : active.includes(i)
                  ? "#ef4444" // Red for active
                  : "#60a5fa", // Blue for unsorted heap
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: "bold",
              transition: "0.3s",
              position: "relative",
              opacity: i >= heapSize ? 0.8 : 1,
            }}
          >
            {value}
            <span
              style={{
                position: "absolute",
                bottom: -20,
                fontSize: 10,
                color: "#666",
              }}
            >
              idx {i}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => startHeapSort("max")}
          disabled={phase !== "idle"}
        >
          Sort Ascending (Max Heap)
        </button>
        <button
          onClick={() => startHeapSort("min")}
          disabled={phase !== "idle"}
        >
          Sort Descending (Min Heap)
        </button>
        <button
          onClick={nextStep}
          style={{ padding: "5px 20px", fontWeight: "bold", fontSize: 16 }}
        >
          Next Step ▶
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div
        style={{ marginTop: 40, borderTop: "1px solid #ddd", paddingTop: 20 }}
      >
        <p>
          <b>How it works:</b>
        </p>
        <ul style={{ fontSize: 14, color: "#444" }}>
          <li>
            <b>Max Heap + Sort:</b> Results in a <b>[1, 2, 3...]</b> sorted
            array.
          </li>
          <li>
            <b>Min Heap + Sort:</b> Results in a <b>[10, 9, 8...]</b> sorted
            array.
          </li>
          <li>
            The <b>Green</b> boxes represent elements already locked into their
            final sorted positions.
          </li>
        </ul>
      </div>
    </div>
  );
}
