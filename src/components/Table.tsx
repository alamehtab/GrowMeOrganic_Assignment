import { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { fetchArtworks } from '../api/api';
import type { Artwork } from '../types/types';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function Table() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [rows, setRows] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const overlayRef = useRef<OverlayPanel>(null);
    const [inputValue, setInputValue] = useState<number | null>(null);

    const visibleSelection = useMemo(() => {
        return rows.filter(r => selectedIds.has(r.id));
    }, [rows, selectedIds]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchArtworks(page, pageSize)
            .then(({ artworks, pagination }) => {
                if (!mounted) return;
                setRows(artworks);
                setTotalRecords(pagination.total);
            })
            .catch(err => console.error(err))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, [page, pageSize]);
    const onSelectionChange = (e: { value: Artwork[] }) => {
        const selectedOnPage = new Set(e.value.map(a => a.id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            rows.forEach(r => {
                if (selectedOnPage.has(r.id)) {
                    next.add(r.id);
                } else {
                    next.delete(r.id);
                }
            });
            return next;
        });
    };

    const onPage = (event: any) => {
        const newPage = Math.floor(event.first / event.rows) + 1;
        setPageSize(event.rows);
        setPage(newPage);
    };
    const handleSelectNRows = async () => {
        if (!inputValue || inputValue <= 0) return;
        const N = inputValue;

        setSelectedIds(new Set());

        let selectedCount = 0;
        let currentPage = 1;
        const newSelectedIds = new Set<number>();

        while (selectedCount < N) {
            const { artworks, pagination } = await fetchArtworks(currentPage, pageSize);
            artworks.forEach(a => {
                if (selectedCount < N) {
                    newSelectedIds.add(a.id);
                    selectedCount++;
                }
            });

            if (currentPage >= pagination.total_pages) break;
            currentPage++;
        }

        setSelectedIds(newSelectedIds);
        setInputValue(null);
        overlayRef.current?.hide();
    };

    const titleHeader = (
        <div className="flex align-items-center gap-2">
            <span>Title</span>
            <i
                className="pi pi-chevron-down cursor-pointer"
                style={{ fontSize: '1rem' }}
                onClick={(e) => overlayRef.current?.toggle(e)}
            ></i>
            <OverlayPanel ref={overlayRef}>
                <div className="p-fluid" style={{ width: '200px' }}>
                    <h5>Select No.of Rows</h5>
                    <InputNumber
                        value={inputValue ?? undefined}
                        onValueChange={(e) => setInputValue(e.value ?? null)}
                        placeholder="Enter number"
                        min={1}
                        className="mb-2"
                    />
                    <Button label="Select" onClick={handleSelectNRows} />
                </div>
            </OverlayPanel>
        </div>
    );

    return (
        <div>
            <DataTable
                value={rows}
                paginator
                rows={pageSize}
                totalRecords={totalRecords}
                first={(page - 1) * pageSize}
                onPage={onPage}
                lazy
                loading={loading}
                selection={visibleSelection}
                onSelectionChange={onSelectionChange}
                selectionMode="checkbox"
                dataKey="id"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="title" header={titleHeader} />
                <Column field="place_of_origin" header="Place of origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date start" />
                <Column field="date_end" header="Date end" />
            </DataTable>
        </div>
    );
}
