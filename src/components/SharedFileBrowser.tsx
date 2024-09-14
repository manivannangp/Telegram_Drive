import { memo, useEffect, useRef } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  FbActions,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileToolbar,
} from "@tw-material/file-browser";
import type { StateSnapshot, VirtuosoGridHandle, VirtuosoHandle } from "react-virtuoso";
import useBreakpoint from "use-breakpoint";

import { isMobile } from "@/utils/common";
import { BREAKPOINTS, defaultViewId } from "@/utils/defaults";
import { shareQueries } from "@/utils/queryOptions";
import { sharefileActions, useShareFileAction } from "@/hooks/useFileAction";
import { useModalStore } from "@/utils/stores";
import PreviewModal from "./modals/Preview";

let firstRender = true;

function isVirtuosoList(value: any): value is VirtuosoHandle {
  return (value as VirtuosoHandle).getState !== undefined;
}

const route = getRouteApi("/_share/share/$id");

const positions = new Map<string, StateSnapshot>();

const disabledActions = [
  FbActions.UploadFiles.id,
  FbActions.CreateFolder.id,
  FbActions.CutFiles.id,
  FbActions.SelectMode.id,
  FbActions.PasteFiles.id,
  FbActions.RenameFile.id,
  FbActions.DeleteFiles.id,
];

export const SharedFileBrowser = memo(({ password }: { password: string }) => {
  const { id } = route.useParams();

  const { parentId } = route.useSearch();

  const listRef = useRef<VirtuosoHandle | VirtuosoGridHandle>(null);

  const { breakpoint } = useBreakpoint(BREAKPOINTS);

  const params = {
    id,
    password,
    parentId,
  };

  const {
    data: files,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(shareQueries.list(params));

  const actionHandler = useShareFileAction(params);

  const modalOpen = useModalStore((state) => state.open);

  const modalOperation = useModalStore((state) => state.operation);

  useEffect(() => {
    if (firstRender) {
      firstRender = false;
      return;
    }

    setTimeout(() => {
      listRef.current?.scrollTo({
        top: positions.get(id + (parentId || ""))?.scrollTop ?? 0,
        left: 0,
      });
    }, 0);

    return () => {
      if (listRef.current && isVirtuosoList(listRef.current)) {
        listRef.current?.getState((state) => positions.set(id + (parentId || ""), state));
      }
    };
  }, [id, parentId]);

  return (
    <div className="size-full m-auto">
      <FileBrowser
        files={files}
        onFileAction={actionHandler()}
        fileActions={sharefileActions}
        breakpoint={breakpoint}
        defaultFileViewActionId={defaultViewId}
        disableEssentailFileActions={disabledActions}
      >
        <FileToolbar className="pt-2" />
        <FileList
          hasNextPage={hasNextPage}
          isNextPageLoading={isFetchingNextPage}
          loadNextPage={fetchNextPage}
          ref={listRef}
        />
        {!isMobile && <FileContextMenu />}
      </FileBrowser>
      {modalOperation === FbActions.OpenFiles.id && modalOpen && (
        <PreviewModal shareId={params.id} files={files} />
      )}
    </div>
  );
});
