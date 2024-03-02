import { ReactNode } from "react";
import { createStreamableUI } from "./streamable";

type ReactNodeGenerator = AsyncGenerator<ReactNode, ReactNode | void>;

type AsyncGeneratorComponent<Props> = (props: Props) => ReactNodeGenerator;

function generator(method: "append" | "update") {
  return function <Props>(
    component: AsyncGeneratorComponent<Props>
  ): (props: Props) => ReactNode {
    const displayName = component.name || "AsyncGeneratorComponent";

    const Comp = (props: Props): ReactNode => {
      const streambable = createStreamableUI();
      const generator = component(props);

      (async () => {
        for await (const value of generator) {
          streambable[method](value);
        }

        streambable.done();
      })().catch(() => {
        // We assume that streamable.value will reject in this case
      });

      return streambable.value;
    };

    Comp.displayName = displayName;
    return Comp;
  };
}

export const appendGenerator = generator("append");
export const updateGenerator = generator("update");
