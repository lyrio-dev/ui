import getScript from "getscript-promise";

const TEX_PACKAGES = ["ams", "boldsymbol", "colorv2", "html", "noundefined", "physics"];

export const loadMathJax = (() => {
  let promise = (async () => {
    window.MathJax = {
      loader: {
        load: ["input/tex-base", ...TEX_PACKAGES.map(packageName => `[tex]/${packageName}`), "output/chtml", "ui/safe"]
      },
      tex: {
        packages: ["base", ...TEX_PACKAGES]
      },
      chtml: {
        adaptiveCSS: false
      }
    };
    await getScript(`${window.cdnjs}/mathjax/${EXTERNAL_PACKAGE_VERSION["mathjax-full"]}/es5/startup.js`);
    await window.MathJax.startup.promise;
    await window.MathJax.startup.document.updateDocument();
  })();
  promise.then(() => (promise = null));

  return () => promise;
})();

export function renderMath(math: string, display: boolean) {
  try {
    window.MathJax.texReset();
    const wrapper = window.MathJax.tex2chtml(math, {
      display
    }) as HTMLElement;

    wrapper.title = math;

    const copy = document.createElement("span");
    copy.className = "copy";
    copy.innerText = math;
    wrapper.appendChild(copy);

    return wrapper;
  } catch (e) {
    console.log(e);

    const wrapper = document.createElement("mjx-container");
    wrapper.className = "MathJax";
    wrapper.setAttribute("jax", "CHTML");
    if (display) wrapper.setAttribute("display", "true");

    const message = document.createElement("span");
    message.innerText = `Failed to render math, ${String(e)}`;
    message.style.fontWeight = "bold";
    message.style.display = "inline-block";
    message.style.border = "2px solid var(--theme-foreground)";
    message.style.padding = "0 4px";

    wrapper.appendChild(message);
    return wrapper;
  }
}
