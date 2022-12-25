import type { MouseEvent, ChangeEvent, MutableRefObject } from 'react';
import { useCallback } from 'react';
import { Flex, Slider } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import {
  RiArrowDownSLine,
  RiFilter3Line,
  RiFolder2Line,
  RiSortAsc,
  RiSortDesc,
} from 'react-icons/ri';
import { AlbumListSort, ServerType, SortOrder } from '/@/renderer/api/types';
import {
  Button,
  DropdownMenu,
  PageHeader,
  Popover,
  SearchInput,
  TextTitle,
  VirtualInfiniteGridRef,
} from '/@/renderer/components';
import {
  useCurrentServer,
  useAlbumListStore,
  useSetAlbumFilters,
  useSetAlbumStore,
  AlbumListFilter,
} from '/@/renderer/store';
import { CardDisplayType } from '/@/renderer/types';
import { useMusicFolders } from '/@/renderer/features/shared';
import styled from 'styled-components';
import { NavidromeAlbumFilters } from '/@/renderer/features/albums/components/navidrome-album-filters';
import { JellyfinAlbumFilters } from '/@/renderer/features/albums/components/jellyfin-album-filters';
import { api } from '/@/renderer/api';
import { controller } from '/@/renderer/api/controller';
import { queryKeys } from '/@/renderer/api/query-keys';

const FILTERS = {
  jellyfin: [
    { defaultOrder: SortOrder.ASC, name: 'Album Artist', value: AlbumListSort.ALBUM_ARTIST },
    {
      defaultOrder: SortOrder.DESC,
      name: 'Community Rating',
      value: AlbumListSort.COMMUNITY_RATING,
    },
    { defaultOrder: SortOrder.DESC, name: 'Critic Rating', value: AlbumListSort.CRITIC_RATING },
    { defaultOrder: SortOrder.ASC, name: 'Name', value: AlbumListSort.NAME },
    { defaultOrder: SortOrder.ASC, name: 'Random', value: AlbumListSort.RANDOM },
    { defaultOrder: SortOrder.DESC, name: 'Recently Added', value: AlbumListSort.RECENTLY_ADDED },
    { defaultOrder: SortOrder.DESC, name: 'Release Date', value: AlbumListSort.RELEASE_DATE },
  ],
  navidrome: [
    { defaultOrder: SortOrder.ASC, name: 'Album Artist', value: AlbumListSort.ALBUM_ARTIST },
    { defaultOrder: SortOrder.ASC, name: 'Artist', value: AlbumListSort.ARTIST },
    { defaultOrder: SortOrder.DESC, name: 'Duration', value: AlbumListSort.DURATION },
    { defaultOrder: SortOrder.DESC, name: 'Most Played', value: AlbumListSort.PLAY_COUNT },
    { defaultOrder: SortOrder.ASC, name: 'Name', value: AlbumListSort.NAME },
    { defaultOrder: SortOrder.ASC, name: 'Random', value: AlbumListSort.RANDOM },
    { defaultOrder: SortOrder.DESC, name: 'Rating', value: AlbumListSort.RATING },
    { defaultOrder: SortOrder.DESC, name: 'Recently Added', value: AlbumListSort.RECENTLY_ADDED },
    { defaultOrder: SortOrder.DESC, name: 'Recently Played', value: AlbumListSort.RECENTLY_PLAYED },
    { defaultOrder: SortOrder.DESC, name: 'Song Count', value: AlbumListSort.SONG_COUNT },
    { defaultOrder: SortOrder.DESC, name: 'Favorited', value: AlbumListSort.FAVORITED },
    { defaultOrder: SortOrder.DESC, name: 'Year', value: AlbumListSort.YEAR },
  ],
};

const ORDER = [
  { name: 'Ascending', value: SortOrder.ASC },
  { name: 'Descending', value: SortOrder.DESC },
];

const HeaderItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface AlbumListHeaderProps {
  gridRef: MutableRefObject<VirtualInfiniteGridRef | null>;
}

export const AlbumListHeader = ({ gridRef }: AlbumListHeaderProps) => {
  const queryClient = useQueryClient();
  const server = useCurrentServer();
  const setPage = useSetAlbumStore();
  const setFilter = useSetAlbumFilters();
  const page = useAlbumListStore();
  const filters = page.filter;

  const musicFoldersQuery = useMusicFolders();

  const sortByLabel =
    (server?.type &&
      FILTERS[server.type as keyof typeof FILTERS].find((f) => f.value === filters.sortBy)?.name) ||
    'Unknown';

  const setSize = throttle(
    (e: number) =>
      setPage({
        list: { ...page, grid: { ...page.grid, size: e } },
      }),
    200,
  );

  const fetch = useCallback(
    async (skip: number, take: number, filters: AlbumListFilter) => {
      const queryKey = queryKeys.albums.list(server?.id || '', {
        limit: take,
        startIndex: skip,
        ...filters,
      });

      const albums = await queryClient.fetchQuery(queryKey, async ({ signal }) =>
        controller.getAlbumList({
          query: {
            limit: take,
            startIndex: skip,
            ...filters,
          },
          server,
          signal,
        }),
      );

      return api.normalize.albumList(albums, server);
    },
    [queryClient, server],
  );

  const handleFilterChange = useCallback(
    async (filters: any) => {
      gridRef.current?.scrollTo(0);
      gridRef.current?.resetLoadMoreItemsCache();

      // Refetching within the virtualized grid may be inconsistent due to it refetching
      // using an outdated set of filters. To avoid this, we fetch using the updated filters
      // and then set the grid's data here.
      const data = await fetch(0, 200, filters);

      if (!data?.items) return;
      gridRef.current?.setItemData(data.items);
    },
    [gridRef, fetch],
  );

  const handleSetSortBy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!e.currentTarget?.value || !server?.type) return;

      const sortOrder = FILTERS[server.type as keyof typeof FILTERS].find(
        (f) => f.value === e.currentTarget.value,
      )?.defaultOrder;

      const updatedFilters = setFilter({
        sortBy: e.currentTarget.value as AlbumListSort,
        sortOrder: sortOrder || SortOrder.ASC,
      });

      handleFilterChange(updatedFilters);
    },
    [handleFilterChange, server?.type, setFilter],
  );

  const handleSetMusicFolder = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!e.currentTarget?.value) return;
      const updatedFilters = setFilter({ musicFolderId: e.currentTarget.value });
      handleFilterChange(updatedFilters);
    },
    [handleFilterChange, setFilter],
  );

  const handleSetOrder = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!e.currentTarget?.value) return;
      const updatedFilters = setFilter({ sortOrder: e.currentTarget.value as SortOrder });
      handleFilterChange(updatedFilters);
    },
    [handleFilterChange, setFilter],
  );

  const handleSetViewType = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!e.currentTarget?.value) return;
      const type = e.currentTarget.value;
      if (type === CardDisplayType.CARD) {
        setPage({ list: { ...page, display: CardDisplayType.CARD } });
      } else if (type === CardDisplayType.POSTER) {
        setPage({ list: { ...page, display: CardDisplayType.POSTER } });
      } else {
        setPage({ list: { ...page, display: CardDisplayType.TABLE } });
      }
    },
    [page, setPage],
  );

  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const updatedFilters = setFilter({ searchTerm: e.target.value });
    handleFilterChange(updatedFilters);
  }, 500);

  return (
    <PageHeader>
      <HeaderItems>
        <Flex
          align="center"
          gap="md"
          justify="center"
        >
          <DropdownMenu position="bottom">
            <DropdownMenu.Target>
              <Button
                compact
                px={0}
                rightIcon={<RiArrowDownSLine size={15} />}
                size="xl"
                variant="subtle"
              >
                <TextTitle
                  fw="bold"
                  order={3}
                >
                  Albums
                </TextTitle>
              </Button>
            </DropdownMenu.Target>
            <DropdownMenu.Dropdown>
              <DropdownMenu.Item>
                <Slider
                  defaultValue={page.grid.size || 0}
                  label={null}
                  onChange={setSize}
                />
              </DropdownMenu.Item>
              <DropdownMenu.Divider />
              <DropdownMenu.Item
                $isActive={page.display === CardDisplayType.CARD}
                value={CardDisplayType.CARD}
                onClick={handleSetViewType}
              >
                Card
              </DropdownMenu.Item>
              <DropdownMenu.Item
                $isActive={page.display === CardDisplayType.POSTER}
                value={CardDisplayType.POSTER}
                onClick={handleSetViewType}
              >
                Poster
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled
                $isActive={page.display === CardDisplayType.TABLE}
                value="list"
                onClick={handleSetViewType}
              >
                List
              </DropdownMenu.Item>
            </DropdownMenu.Dropdown>
          </DropdownMenu>
          <DropdownMenu position="bottom">
            <DropdownMenu.Target>
              <Button
                compact
                fw="normal"
                variant="subtle"
              >
                {sortByLabel}
              </Button>
            </DropdownMenu.Target>
            <DropdownMenu.Dropdown>
              {FILTERS[server?.type as keyof typeof FILTERS].map((filter) => (
                <DropdownMenu.Item
                  key={`filter-${filter.name}`}
                  $isActive={filter.value === filters.sortBy}
                  value={filter.value}
                  onClick={handleSetSortBy}
                >
                  {filter.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Dropdown>
          </DropdownMenu>
          <DropdownMenu position="bottom">
            <DropdownMenu.Target>
              <Button
                compact
                fw="normal"
                variant="subtle"
              >
                {filters.sortOrder === SortOrder.ASC ? (
                  <RiSortAsc size={15} />
                ) : (
                  <RiSortDesc size={15} />
                )}
              </Button>
            </DropdownMenu.Target>
            <DropdownMenu.Dropdown>
              {ORDER.map((sort) => (
                <DropdownMenu.Item
                  key={`sort-${sort.value}`}
                  $isActive={sort.value === filters.sortOrder}
                  value={sort.value}
                  onClick={handleSetOrder}
                >
                  {sort.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Dropdown>
          </DropdownMenu>
          {server?.type === ServerType.JELLYFIN && (
            <DropdownMenu position="bottom">
              <DropdownMenu.Target>
                <Button
                  compact
                  fw="normal"
                  variant="subtle"
                >
                  <RiFolder2Line size={15} />
                </Button>
              </DropdownMenu.Target>
              <DropdownMenu.Dropdown>
                {musicFoldersQuery.data?.map((folder) => (
                  <DropdownMenu.Item
                    key={`musicFolder-${folder.id}`}
                    $isActive={filters.musicFolderId === folder.id}
                    value={folder.id}
                    onClick={handleSetMusicFolder}
                  >
                    {folder.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Dropdown>
            </DropdownMenu>
          )}
          <Popover>
            <Popover.Target>
              <Button
                compact
                fw="normal"
                variant="subtle"
              >
                <RiFilter3Line size={15} />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              {server?.type === ServerType.NAVIDROME ? (
                <NavidromeAlbumFilters />
              ) : (
                <JellyfinAlbumFilters />
              )}
            </Popover.Dropdown>
          </Popover>
        </Flex>
        <Flex>
          <SearchInput
            defaultValue={page.filter.searchTerm}
            onChange={handleSearch}
          />
        </Flex>
      </HeaderItems>
    </PageHeader>
  );
};