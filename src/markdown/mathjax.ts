import { mathjax } from "mathjax-full/js/mathjax";
import { TeX } from "mathjax-full/js/input/tex";
import { SVG } from "mathjax-full/js/output/svg";
import { browserAdaptor } from "mathjax-full/js/adaptors/browserAdaptor";
import { HTMLHandler } from "mathjax-full/js/handlers/html/HTMLHandler";
import { SafeHandler } from "mathjax-full/js/ui/safe/SafeHandler";

// Load TeX packages
import "mathjax-full/js/input/tex/ams/AmsConfiguration.js";
import "mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js";
import "mathjax-full/js/input/tex/colorv2/ColorV2Configuration.js";
import "mathjax-full/js/input/tex/html/HtmlConfiguration.js";
import "mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js";
import "mathjax-full/js/input/tex/physics/PhysicsConfiguration.js";

mathjax.handlers.register(SafeHandler(new HTMLHandler(browserAdaptor())));

const mathDocument = mathjax.document(document, {
  InputJax: new TeX({
    packages: {
      "[+]": ["ams", "boldsymbol", "colorv2", "html", "noundefined", "physics"]
    }
  }),
  OutputJax: new SVG()
});

// Add CSS styles
mathDocument.updateDocument();

export function renderMath(math: string, display: boolean) {
  try {
    const wrapper = mathDocument.convert(math, {
      display
    });

    const title = document.createElement("title");
    title.innerText = math;

    const defsElement = wrapper.getElementsByTagName("defs")[0];
    defsElement.parentNode.insertBefore(title, defsElement);

    return wrapper;
  } catch (e) {
    console.log(e);

    const wrapper = document.createElement("mjx-container");
    wrapper.className = "MathJax";
    wrapper.setAttribute("jax", "SVG");
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
