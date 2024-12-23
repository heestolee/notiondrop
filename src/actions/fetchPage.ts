"use server";

export interface FetchPageResult {
  pageId: string;
  snapshotHtml: string | null;
}

export async function fetchPage(sourceUrl: string): Promise<FetchPageResult> {
  const pageId = sourceUrl.split("/").pop() || "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/puppeteer-preview-snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl }),
    });

    if (!response.ok) throw new Error("페이지 페칭 실패");

    const data = (await response.json()) as { snapshotHtml: string | null };
    const sanitizedHtml = data.snapshotHtml || "";

    return { pageId, snapshotHtml: sanitizedHtml || null };
  } catch (error) {
    console.error("페이지 페칭 에러:", error);
    throw error;
  }
}
