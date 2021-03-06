import {
  actions,
  selectors,
  createStore,
  makeSource
} from "../../../utils/test-head";
const { getSource, getSources, getSelectedSource } = selectors;

// eslint-disable-next-line max-len
import { sourceThreadClient as threadClient } from "../../tests/helpers/threadClient.js";

describe("sources - new sources", () => {
  it("should add sources to state", async () => {
    const { dispatch, getState } = createStore(threadClient);
    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("jquery.js")));

    expect(getSources(getState()).size).toEqual(2);
    const base = getSource(getState(), "base.js");
    const jquery = getSource(getState(), "jquery.js");
    expect(base.get("id")).toEqual("base.js");
    expect(jquery.get("id")).toEqual("jquery.js");
  });

  it("should not add multiple identical sources", async () => {
    const { dispatch, getState } = createStore(threadClient);

    await dispatch(actions.newSource(makeSource("base.js")));
    await dispatch(actions.newSource(makeSource("base.js")));

    expect(getSources(getState()).size).toEqual(1);
  });

  it("should automatically select a pending source", async () => {
    const { dispatch, getState } = createStore(threadClient);
    const baseSource = makeSource("base.js");
    await dispatch(actions.selectSourceURL(baseSource.url));

    expect(getSelectedSource(getState())).toBe(undefined);
    await dispatch(actions.newSource(baseSource));
    expect(getSelectedSource(getState()).get("url")).toBe(baseSource.url);
  });

  it("should add original sources", async () => {
    const { dispatch, getState } = createStore(
      threadClient,
      {},
      {
        getOriginalURLs: () => Promise.resolve(["magic.js"]),
        generatedToOriginalId: (a, b) => `${a}/${b}`
      }
    );

    await dispatch(
      actions.newSource(makeSource("base.js", { sourceMapURL: "base.js.map" }))
    );

    const magic = getSource(getState(), "base.js/magic.js");
    expect(magic.get("url")).toEqual("magic.js");
  });

  // eslint-disable-next-line
  it("should no attempt to fetch original sources if it's missing a source map url", async () => {
    const getOriginalURLs = jest.fn();
    const { dispatch } = createStore(threadClient, {}, { getOriginalURLs });

    await dispatch(actions.newSource(makeSource("base.js")));
    expect(getOriginalURLs).not.toHaveBeenCalled();
  });
});
