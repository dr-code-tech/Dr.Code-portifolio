# Dr. Code Portfolio

A modern, premium personal portfolio for Dr. Code showcasing web development, machine learning, and digital product work.

## Run locally

Open `index.html` directly in a browser, or serve the folder locally with:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Contact form integration

The contact form validates its fields in the browser and opens a prefilled email draft by default; it does not claim that the message was sent. To connect a backend, set `data-contact-endpoint` on the form in `index.html` to a JSON `POST` endpoint that accepts `name`, `email`, and `message`. The UI reports success only when the endpoint responds with a successful HTTP status.