import { useState, useRef, useEffect } from "react";
import { useFHEZmail } from "@/hooks/useFHEZmail";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { Mail, LoadingBarRef } from "@/types";
import { TAB_INDEXES, TabIndex } from "@/constants/index";

export const useZmailManager = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const { isInitialized, sendMail } = useFHEZmail({
    fhevmDecryptionSignatureStorage,
  });

  // ===== STATE =====
  const [isOpenEditor, setIsOpenEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEXES.INBOX);
  const [activeTabCount, setActiveTabCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredMails, setFilteredMails] = useState<Mail[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeMailId, setActiveMailId] = useState<number | null>(null);
  const [selectedMailIds, setSelectedMailIds] = useState<number[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("");
  const [threadMails, setThreadMails] = useState<Mail[]>([]);
  const [mails, setMails] = useState<Mail[]>([]);

  // ===== REF =====
  const loadingBarRef = useRef<LoadingBarRef["current"]>(null);

  // ===== METHODS =====
  const refreshMap: Record<number, () => void> = {
    [TAB_INDEXES.STARRED]: () => console.log("refresh starred"),
    [TAB_INDEXES.SENT]: () => console.log("refresh sent"),
    [TAB_INDEXES.ARCHIVE]: () => console.log("refresh archive"),
    [TAB_INDEXES.SPAM]: () => console.log("refresh spam"),
    [TAB_INDEXES.READ]: () => console.log("refresh read"),
    [TAB_INDEXES.TRASH]: () => console.log("refresh trash"),
  };

  const refreshByTab = (tabIndex: number) => refreshMap[tabIndex] ?? (() => {});
  const getMailIds = () => mails.map((mail) => mail.id);

  const executeBulkAction = async () => {};
  const onReply = async () => {};
  const onForward = async () => {};

  // ===== EFFECTS =====
  useEffect(() => {
    if (isInitialized) {};
  }, [isInitialized]);

  useEffect(() => {
    setIsSelecting(false);
    setActiveMailId(null);
    setIsReplying(false);
    setIsForwarding(false);
    setSelectedMailIds([]);
  }, [activeTab]);

  // ===== RETURN =====
  return {
    state: {
      isOpenEditor,
      activeTab,
      activeTabCount,
      searchValue,
      isSearching,
      filteredMails,
      isSelecting,
      activeMailId,
      selectedMailIds,
      isReplying,
      isForwarding,
      bulkActionType,
      threadMails,
      mails,
    },
    setters: {
      setIsOpenEditor,
      setActiveTab,
      setActiveTabCount,
      setSearchValue,
      setIsSearching,
      setFilteredMails,
      setIsSelecting,
      setActiveMailId,
      setSelectedMailIds,
      setIsReplying,
      setIsForwarding,
      setBulkActionType,
      setThreadMails,
      setMails,
    },
    refs: {
      loadingBarRef,
    },
    methods: {
      sendMail,
      getMailIds,
      refreshByTab,
      executeBulkAction,
      onReply,
      onForward,
    },
  };
};
