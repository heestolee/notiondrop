import React from "react";
import FormContainer from "@/components/shared/FormContainer";
import InputField from "@/components/shared/InputField";
import SubmitButton from "@/components/shared/SubmitButton";

export interface UrlInputAreaProps {
  sourceUrl: string;
  setSourceUrl: React.Dispatch<React.SetStateAction<string>>;
  handleFetch: () => Promise<void>;
  isLoading: boolean;
}

export default function UrlInputArea({
  sourceUrl,
  setSourceUrl,
  handleFetch,
  isLoading,
}: UrlInputAreaProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await handleFetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <InputField
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="웹사이트 주소를 입력해주세요."
        isRequired
      />
      <SubmitButton
        label="페이지 불러오기"
        colorScheme="blue"
        isLoading={isLoading}
      />
    </FormContainer>
  );
}
