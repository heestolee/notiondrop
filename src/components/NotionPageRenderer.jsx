"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box } from "@chakra-ui/react";

export default function NotionPageRenderer({
  notionPageId,
  deployMode,
  onSnapshotReady,
  selectedBlocks,
  handleSelectBlock,
  setSelectedBlocksHtml,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const snapshotHtmlRef = useRef(null);
  const pageRef = useRef(null);

  async function fetchPreviewContent(pageId) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/puppeteer-preview-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notionUrl: `https://www.notion.so/${pageId}` }),
      });

      if (!response.ok) throw new Error("노션 페이지 페칭 실패");
      const data = await response.json();
      snapshotHtmlRef.current = data.snapshotHtml;
      onSnapshotReady();
    } catch (error) {
      console.error("노션 페이지 페칭 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (notionPageId) fetchPreviewContent(notionPageId);
  }, [notionPageId]);

  const handleBlockClick = useCallback(
    (event) => {
      event.preventDefault();
      const blockElement = event.currentTarget;
      const closestTopBlock = blockElement.closest('.notion-page-content > *');
      const topBlockId = closestTopBlock?.getAttribute("data-block-id");
      const blockIndex = [...closestTopBlock.parentElement.children].indexOf(closestTopBlock);

      if (deployMode === "partial" && topBlockId) {
        handleSelectBlock(topBlockId);
        setSelectedBlocksHtml((prev) => {
          if (prev.some(block => block.id === topBlockId)) {
            return prev.filter(block => block.id !== topBlockId);
          }
          return [...prev, { id: topBlockId, index: blockIndex, html: closestTopBlock.outerHTML }];
        });
      }
    },
    [handleSelectBlock, deployMode, setSelectedBlocksHtml],
  );

  useEffect(() => {
    if (deployMode !== "partial") return;
    const blockElements = document.querySelectorAll(".notion-page-content > *");
    blockElements.forEach((block) => {
      const topBlockId = block.getAttribute("data-block-id");

      block.addEventListener("click", handleBlockClick);

      if (selectedBlocks[topBlockId]) {
        block.style.outline = "2px solid #62aaff";
      } else {
        block.style.outline = "none";
        block.style.backgroundColor = "white";
      }

      block.addEventListener("mouseenter", () => {
        if (!selectedBlocks[topBlockId]) {
          block.style.outline = "1px dashed lightgray";
        }
      });

      block.addEventListener("mouseleave", () => {
        if (!selectedBlocks[topBlockId]) {
          block.style.outline = "none";
        }
      });
    });

    return () => {
      blockElements.forEach((block) => {
        block.removeEventListener("click", handleBlockClick);
      });
    };
  }, [selectedBlocks, handleBlockClick, deployMode]);

  if (isLoading) return null;
  if (!snapshotHtmlRef.current) return <div>No data available.</div>;

  return (
    <Box h="45rem" textAlign="left" ref={pageRef}>
      <Box dangerouslySetInnerHTML={{ __html: snapshotHtmlRef.current }} />
    </Box>
  );
}
