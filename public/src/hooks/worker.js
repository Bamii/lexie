// import mexp from "math-expression-evaluator"
// Whenever the worker receives a message:
self.onmessage = event => {
  try {
    // Evaulate the math problem.
    // const result = mexp.eval(event.data)
    console.log(event.data);
    // Return the result of the calculation.
    self.postMessage("result")
  } catch {
    // If there was an error, let the user know.
    self.postMessage("Please enter a valid math problem")
  }
}