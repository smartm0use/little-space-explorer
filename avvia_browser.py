"""Serve l'atlante locale e apre il browser. Nessuna dipendenza Python."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


if __name__ == "__main__":
    root = Path(__file__).resolve().parent / "web"
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"Little Space Explorer: {url}\nPremi Ctrl+C per fermare il server.", flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
