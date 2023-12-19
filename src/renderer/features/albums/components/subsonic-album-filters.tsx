import { Divider, Group, Stack } from '@mantine/core';
import debounce from 'lodash/debounce';
import { ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GenreListSort, LibraryItem, SortOrder } from '/@/renderer/api/types';
import { NumberInput, Select, Switch, Text } from '/@/renderer/components';
import { useGenreList } from '/@/renderer/features/genres';
import { AlbumListFilter, useListStoreActions, useListStoreByKey } from '/@/renderer/store';

interface SubsonicAlbumFiltersProps {
    onFilterChange: (filters: AlbumListFilter) => void;
    pageKey: string;
    serverId?: string;
}

export const SubsonicAlbumFilters = ({
    onFilterChange,
    pageKey,
    serverId,
}: SubsonicAlbumFiltersProps) => {
    const { t } = useTranslation();
    const { filter } = useListStoreByKey({ key: pageKey });
    const { setFilter } = useListStoreActions();

    const genreListQuery = useGenreList({
        query: {
            sortBy: GenreListSort.NAME,
            sortOrder: SortOrder.ASC,
            startIndex: 0,
        },
        serverId,
    });

    const genreList = useMemo(() => {
        if (!genreListQuery?.data) return [];
        return genreListQuery.data.items.map((genre) => ({
            label: genre.name,
            value: genre.id,
        }));
    }, [genreListQuery.data]);

    const handleGenresFilter = debounce((e: string | null) => {
        const updatedFilters = setFilter({
            data: {
                genre: e || undefined,
            },
            itemType: LibraryItem.ALBUM,
            key: pageKey,
        }) as AlbumListFilter;

        onFilterChange(updatedFilters);
    }, 250);

    const toggleFilters = [
        {
            label: t('filter.isFavorited', { postProcess: 'sentenceCase' }),
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
                const updatedFilters = setFilter({
                    data: {
                        isFavorite: e.target.checked ? true : undefined,
                    },
                    itemType: LibraryItem.ALBUM,
                    key: pageKey,
                }) as AlbumListFilter;
                onFilterChange(updatedFilters);
            },
            value: filter.isFavorite,
        },
    ];

    const handleYearFilter = debounce((e: number | string, type: 'min' | 'max') => {
        let data = {};

        if (type === 'min') {
            data = {
                minYear: e || undefined,
            };
        } else {
            data = {
                maxYear: e || undefined,
            };
        }

        console.log('data', data);

        const updatedFilters = setFilter({
            data,
            itemType: LibraryItem.ALBUM,
            key: pageKey,
        }) as AlbumListFilter;

        onFilterChange(updatedFilters);
    }, 500);

    return (
        <Stack p="0.8rem">
            {toggleFilters.map((filter) => (
                <Group
                    key={`nd-filter-${filter.label}`}
                    position="apart"
                >
                    <Text>{filter.label}</Text>
                    <Switch
                        checked={filter?.value || false}
                        onChange={filter.onChange}
                    />
                </Group>
            ))}
            <Divider my="0.5rem" />
            <Group grow>
                <NumberInput
                    defaultValue={filter.minYear}
                    disabled={filter.genre}
                    hideControls={false}
                    label={t('filter.fromYear', { postProcess: 'sentenceCase' })}
                    max={5000}
                    min={0}
                    onChange={(e) => handleYearFilter(e, 'min')}
                />
                <NumberInput
                    defaultValue={filter.maxYear}
                    disabled={filter.genre}
                    hideControls={false}
                    label={t('filter.toYear', { postProcess: 'sentenceCase' })}
                    max={5000}
                    min={0}
                    onChange={(e) => handleYearFilter(e, 'max')}
                />
            </Group>
            <Group grow>
                <Select
                    clearable
                    searchable
                    data={genreList}
                    defaultValue={filter.genre}
                    disabled={filter.minYear || filter.maxYear}
                    label={t('entity.genre', { count: 1, postProcess: 'titleCase' })}
                    onChange={handleGenresFilter}
                />
            </Group>
        </Stack>
    );
};