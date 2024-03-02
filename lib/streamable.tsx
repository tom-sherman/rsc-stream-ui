import { createResolvablePromise, createSuspensedChunk } from "./utils";

/**
 * Create a piece of changable UI that can be streamed to the client.
 * On the client side, it can be rendered as a normal React node.
 */
export function createStreamableUI(initialValue?: React.ReactNode) {
  let currentValue = initialValue;
  let closed = false;
  let { row, resolve, reject } = createSuspensedChunk(initialValue);

  function assertStream() {
    if (closed) {
      throw new Error("UI stream is already closed.");
    }
  }

  return {
    value: row,
    update(value: React.ReactNode) {
      assertStream();

      const resolvable = createResolvablePromise();
      resolve({ value, done: false, next: resolvable.promise });
      resolve = resolvable.resolve;
      reject = resolvable.reject;
      currentValue = value;
    },
    append(value: React.ReactNode) {
      assertStream();

      const resolvable = createResolvablePromise();
      resolve({ value, done: false, next: resolvable.promise });
      resolve = resolvable.resolve;
      reject = resolvable.reject;
      if (typeof currentValue === "string" && typeof value === "string") {
        currentValue += value;
      } else {
        currentValue = (
          <>
            {currentValue}
            {value}
          </>
        );
      }
    },
    error(error: any) {
      assertStream();

      closed = true;
      reject(error);
    },
    done(...args: any) {
      assertStream();

      closed = true;
      if (args.length) {
        resolve({ value: args[0], done: true });
        return;
      }
      resolve({ value: currentValue, done: true });
    },
  };
}

const STREAMABLE_VALUE_TYPE = Symbol.for("ui.streamable.value");

/**
 * Create a wrapped, changable value that can be streamed to the client.
 * On the client side, the value can be accessed via the useStreamableValue() hook.
 */
export function createStreamableValue<T = any>(initialValue?: T) {
  // let currentValue = initialValue
  let closed = false;
  let { promise, resolve, reject } = createResolvablePromise();

  function assertStream() {
    if (closed) {
      throw new Error("Value stream is already closed.");
    }
  }

  function createWrapped(val: T | undefined, initial?: boolean) {
    if (initial) {
      return {
        type: STREAMABLE_VALUE_TYPE,
        curr: val,
        next: promise,
      };
    }

    return {
      curr: val,
      next: promise,
    };
  }

  return {
    value: createWrapped(initialValue, true),
    update(value: T) {
      assertStream();

      const resolvePrevious = resolve;
      const resolvable = createResolvablePromise();
      promise = resolvable.promise;
      resolve = resolvable.resolve;
      reject = resolvable.reject;

      resolvePrevious(createWrapped(value));

      // currentValue = value
    },
    error(error: any) {
      assertStream();

      closed = true;
      reject(error);
    },
    done(...args: any) {
      assertStream();

      closed = true;

      if (args.length) {
        resolve({ curr: args[0] });
        return;
      }

      resolve({});
    },
  };
}
