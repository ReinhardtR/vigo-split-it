"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      return;
    }

    const response = await fetch("/api/my-thing", {
      method: "POST",
      body: file,
    });

    console.log(response);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">Hello World!</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
