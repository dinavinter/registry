/** @jsxImportSource npm:hono@latest/jsx */
import ValTown from "npm:@valtown/sdk";
import { Hono } from "npm:hono";
import { PropsWithChildren } from "npm:hono/jsx";
import { jsxRenderer } from "npm:hono/jsx-renderer";

const app = new Hono();

app.use(
  "/*",
  jsxRenderer(({ children }: PropsWithChildren) => {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>HTTP Gallery</title>
          <meta name="description" content="HTTP Files Gallery" />
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
        </head>
        <body className="bg-gray-50 min-h-screen">
          {children}
          <script dangerouslySetInnerHTML={{ __html: `lucide.createIcons();` }} />
        </body>
      </html>
    );
  }),
);

app.get("/:zon/files", async (c) => {
  const client = new ValTown({ bearerToken: import.meta.env.VAL_TOWN_API_KEY });
  // Get files
  const { id: zon } = await client.me.vals.list({
    limit: 100,
    offset: 0,
  }).then(res => res.data).then(files => files.find((z) => z.name === c.req.param("zon"))) || { id: "" };

  const files = await client.vals.files.retrieve(zon, {
    path: "",
    recursive: true,
  }).then(res => res.data);

  return c.json({
    files: files.map((file) => ({
      ...file,
      likeCount: 0,
      referenceCount: 0,
    })),
    zon: c.req.param("zon"),
  });
});

async function getZon(zon: string) {
  const client = new ValTown();
  // Get files
  const { id } = await client.me.vals.list({
    limit: 100,
    offset: 0,
  }).then(res => res.data).then(files => files.find((z) => z.name === zon)) || { id: "" };

  const files = await client.vals.files.retrieve(id, {
    path: "",
    recursive: true,
  }).then(res => res.data);

  return {
    files: files.map((file) => ({
      ...file,
      likeCount: 0,
      referenceCount: 0,
    })),
    name: zon,
    id: id,
  };
}

app.get("/",  (c) => c.redirect("registry"));
app.get("/:zon", async (c) => {
  // Fetch vals from ValTown API
  const { files } = await getZon(c.req.param("zon"));
  const httpFiles = files.filter((file) => file.type === "http");

  return c.render(
    <main className="container mx-auto px-4 py-8">
      <section className="mb-10 rounded-xl overflow-hidden shadow-lg relative">
        <img
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
          alt="HTTP Gallery Hero"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-8">
          <div className="flex items-center mb-2">
            <i
              data-lucide="globe"
              className="w-10 h-10 text-green-400 mr-3 bg-white/10 rounded-full p-2 border border-white/20"
            >
            </i>
            <h1 className="text-4xl font-bold text-white drop-shadow">HTTP Gallery</h1>
          </div>
          <p className="text-lg text-gray-200 max-w-2xl">
            Explore HTTP endpoints and APIs from ValTown. Discover and interact with web services built by the
            community.
          </p>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {httpFiles.map((file: any) => (
          <a
            key={file.name}
            href={`/${file.name}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-100 group"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <i data-lucide="globe" className="h-5 w-5 text-green-500"></i>
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                    {file.name}
                  </h3>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  HTTP
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                {file.description && (
                  <pre className="font-mono text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-16">
                    {file.description.slice(0, 100)}...
                  </pre>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <i data-lucide="star" className="h-4 w-4 mr-1"></i>
                    <span>{file.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <i data-lucide="git-fork" className="h-4 w-4 mr-1"></i>
                    <span>{file.referenceCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <i data-lucide="user" className="h-4 w-4 mr-1"></i>
                    <span>{file.author?.username || ""}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-xs">
                  <div>Created: {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ""}</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>,
  );
});

export default app.fetch;


// export default app;