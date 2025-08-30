import { useState, useRef, useEffect } from "react";
import { useFHEZmail } from "@/hooks/useFHEZmail";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { Mail, Box, LoadingBarRef } from "@/types";
import { TAB_INDEXES, TabIndex } from "@/constants/index";

import isEqual from "lodash/isEqual";

export const useZmailManager = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    isInitialized,
    getInbox,
    getTrash,
    getSent,
    getRead,
    getSpam,
    getArchive,
    getStarred,
    getThread,
    sendMail,
    reply,
    forward,
    moveMails,
  } = useFHEZmail({
    fhevmDecryptionSignatureStorage,
  });

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [isOpenEditor, setIsOpenEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEXES.INBOX);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredMails, setFilteredMails] = useState<Mail[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeMail, setActiveMail] = useState<Mail | null>(null);
  const [selectedMailIds, setSelectedMailIds] = useState<number[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<Box | null>(null);
  const [threadMails, setThreadMails] = useState<Mail[]>([]);
  const [mails, setMails] = useState<Mail[]>([]);

  // ===== REF =====
  const loadingBarRef = useRef<LoadingBarRef["current"]>(null);

  const refreshMap: Record<number, () => Promise<Mail[]>> = {
    [TAB_INDEXES.SENT]: () => getSent(),
    [TAB_INDEXES.SPAM]: () => getSpam(),
    [TAB_INDEXES.READ]: () => getRead(),
    [TAB_INDEXES.INBOX]: () => getInbox(),
    [TAB_INDEXES.TRASH]: () => getTrash(),
    [TAB_INDEXES.STARRED]: () => getStarred(),
    [TAB_INDEXES.ARCHIVE]: () => getArchive(),
  };

  const refreshByTab = async (tabIndex: number): Promise<Mail[]> => {
    const fn = refreshMap[tabIndex];
    return fn ? await fn() : [];
  };

  const getMailIds = () => mails.map((mail) => mail.id);

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (isInitialized) {
        const mails = await refreshByTab(activeTab);
        setMails(mails);
      }
    };

    run();
  }, [isInitialized]);

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (isInitialized) {
        const fetchData = async () => {
          const newMails = await refreshByTab(activeTab);
          !isEqual(newMails, mails) && setMails(newMails);
        };
        setLoading(true);
        await fetchData();
        setLoading(false);
        const intervalId = setInterval(fetchData, 5000);

        clearInterval(intervalId);
      }
    };
    run();
  }, [activeTab, isInitialized]);

  useEffect(() => {
    const run = async () => {
      if (activeMail?.threadId) {
        const threadMails = await getThread(activeMail.threadId);
        setThreadMails(threadMails);
      }
    };

    run();
  }, [activeMail]);

  useEffect(() => {
    setIsSelecting(false);
    setActiveMail(null);
    setIsReplying(false);
    setIsForwarding(false);
    setSelectedMailIds([]);
    setThreadMails([]);
  }, [activeTab]);

  return {
    state: {
      loading,
      isOpenEditor,
      activeTab,
      searchValue,
      isSearching,
      filteredMails,
      isSelecting,
      activeMail,
      selectedMailIds,
      isReplying,
      isForwarding,
      bulkActionType,
      threadMails,
      mails,
    },
    setters: {
      setLoading,
      setIsOpenEditor,
      setActiveTab,
      setSearchValue,
      setIsSearching,
      setFilteredMails,
      setIsSelecting,
      setActiveMail,
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
      reply,
      forward,
      getMailIds,
      refreshByTab,
      moveMails,
    },
  };
};
