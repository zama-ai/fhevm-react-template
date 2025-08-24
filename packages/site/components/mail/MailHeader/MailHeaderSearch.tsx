import "@/styles/mail-header-search.css";
import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";

type MailHeaderSearchProps = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
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
          placeholder="Search"
          className="mediumRegular"
        />
      </div>
    </div>
  );
}
