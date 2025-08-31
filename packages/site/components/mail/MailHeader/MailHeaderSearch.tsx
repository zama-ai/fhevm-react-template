import "@/styles/mail-header-search.css";
import { ChangeEvent, useState } from "react";

type MailHeaderSearchProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
};

export default function MailHeaderSearch({
  searchValue,
  setSearchValue,
}: MailHeaderSearchProps) {
  const [onFocus, setOnFocus] = useState<boolean>(false);

  return (
    <div className="searchbar">
      <div className={`${onFocus ? "input-focus" : ""} input`}>
        <img src="/search-image.svg" alt="Search" />
        <input
          value={searchValue}
          onFocus={() => {
            setOnFocus(true);
            setSearchValue(searchValue);
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          type="text"
          placeholder="Search sender or recipient address"
          className="mediumRegular"
        />
      </div>
    </div>
  );
}
