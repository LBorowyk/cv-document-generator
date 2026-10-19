# cv-document-generator

## API

`POST /generate-latex` генерує LaTeX-документ із JSON-даних CV. Відповідь має
тип `application/x-tex` і завантажується як `cv.tex`.

Приклад запиту:

```json
{
  "name": "Jane Doe",
  "title": "Software Engineer",
  "email": "jane@example.com",
  "skills": ["TypeScript", "Node.js"],
  "experience": [{
    "company": "Example Inc.",
    "role": "Software Engineer",
    "period": "2022--2025",
    "achievements": ["Built an API"]
  }],
  "education": []
}
```
