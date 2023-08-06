import * as ReactDOM from "react-dom";
import { App } from "./client/components/App";

console.log("rendering...");

function render() {
  ReactDOM.render(<App />, document.body);
}

render();
