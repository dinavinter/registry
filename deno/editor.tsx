/** @jsxImportSource npm:hono@latest/jsx */

import { Hono } from "npm:hono";
import { Context } from "npm:hono";
import { PropsWithChildren } from "npm:hono/jsx";
import { jsxRenderer } from "npm:hono/jsx-renderer";

import ValTown from "npm:@valtown/sdk";

const app = new Hono();

// JSX renderer setup
app.use(
  "*",
  jsxRenderer(({ children }: PropsWithChildren) => {
    return (
      <html lang="en">
        <head>
          <title>ValTown File Editor</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/lucide-icons@latest/dist/umd/lucide.min.css" rel="stylesheet" />
          <script src="https://esm.sh/@cxai/ide@1.0.19" type={"module"}></script>
        </head>
        <body>
          <div id="app">{children}</div>
        </body>
      </html>
    );
  }),
);

 

// Routes

app.get("/", async (c: Context) => {
  return c.redirect("/registry/http");
});

app.get("/:zon/:file", async (c: Context) => { 
  const {zon, file} = c.req.param();
  return c.render(<div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <i className="lucide-code-2 h-6 w-6 text-blue-500"></i>
            <h1 className="text-xl font-semibold text-gray-900">{file}</h1>
          </div>
          <button
            type="button"
            id="saveButton"
            className="flex items-center px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
          >
            <i className="lucide-save h-4 w-4 mr-2"></i>
            Save
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-12rem)] w-full">
      <ts-editor
          id="editor"
          component={`${zon}/${file}`}
          room={`@vals`}
          url={`wss://yjs.cfapps.us10-001.hana.ondemand.com`}
          className="h-full w-full"
        >
        </ts-editor>

      </div>
    </div>
  </div>);
});

app.post("/:zon/:file", async (c: Context) => {
  const { zon, file } = c.req.param();
  const { content } = await c.req.json();
  const client = new ValTown({ bearerToken: Deno.env.get("VAL_TOWN_API_KEY") });

  try {
    const zonData = await client.me.vals.list({
      limit: 100,
      offset: 0,
    }).then(res => res.data.find((z) => z.name === zon));

    if (!zonData) {
      return c.json({ error: `Zon '${zon}' not found` }, 404);
    }

    await client.vals.files.update(zonData.id, {
      path: file,
      content: content,
    });

    return c.json({ success: true });
  } catch (error: unknown) {
    console.error("Error:", error);
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});


// Start the server
export default app;