import { useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    type Connection,
    type Edge,
    type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UnlockableNode } from './UnlockableNode';

const nodeTypes = {
    unlockable: UnlockableNode,
};

const initialEdges: Edge[] = [
    // Main Backbone
    { id: 'e1-r', source: '1', target: 'r-head', animated: true, style: { stroke: '#61dafb' } },
    { id: 'er-2', source: 'r-head', target: '2', animated: true, style: { stroke: '#61dafb' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#61dafb' } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#61dafb' } },
    { id: 'e4-c', source: '4', target: 'c-head', animated: true, style: { stroke: '#a855f7' } },
    { id: 'ec-5', source: 'c-head', target: '5', animated: true, style: { stroke: '#a855f7' } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#a855f7' } },

    // Side Branches
    { id: 'e3-3b', source: '3', target: '3b', animated: true, style: { stroke: '#ef4444', strokeDasharray: '5,5' }, label: 'No Changes' },
    { id: 'e5-5b', source: '5', target: '5b', animated: true, style: { stroke: '#fbbf24' }, label: 'Blocking' },
    { id: 'e6-6b', source: '6', target: '6b', animated: true, style: { stroke: '#10b981' }, label: 'Post-Paint' },
];

const initialNodes: Node[] = [
    // Root Node
    {
        id: '1',
        type: 'unlockable',
        position: { x: 400, y: 0 },
        data: {
            label: 'Trigger & Start',
            description: 'Un cambio di stato (setState) o di props avvia il processo di rendering.',
            type: 'trigger',
            isLocked: false,
            onUnlock: () => { },
        },
    },

    // --- RENDER PHASE ---
    {
        id: 'r-head',
        type: 'default',
        position: { x: 400, y: 140 },
        data: { label: 'RENDER PHASE (Asincrona / Pura)' },
        style: { background: 'rgba(97, 218, 251, 0.1)', border: '2px dashed #61dafb', color: '#61dafb', fontWeight: 'bold', width: 220 },
    },
    {
        id: '2',
        type: 'unlockable',
        position: { x: 400, y: 240 },
        data: {
            label: 'Generate VDOM',
            description: 'React richiama i tuoi componenti per costruire il nuovo albero virtuale.',
            type: 'vdom',
            isLocked: true,
            onUnlock: () => { },
        },
    },
    {
        id: '3',
        type: 'unlockable',
        position: { x: 400, y: 420 },
        data: {
            label: 'Reconciliation',
            description: 'Confronto tra vecchio e nuovo VDOM per identificare cosa è cambiato.',
            type: 'reconciliation',
            isLocked: true,
            onUnlock: () => { },
        },
    },
    {
        id: '4',
        type: 'unlockable',
        position: { x: 400, y: 600 },
        data: {
            label: 'Fiber Prep (R16+)',
            description: 'Il motore Fiber organizza i task in base alla priorità (scheduling).',
            type: 'fiber',
            isLocked: true,
            onUnlock: () => { },
        },
    },

    // --- COMMIT PHASE ---
    {
        id: 'c-head',
        type: 'default',
        position: { x: 400, y: 780 },
        data: { label: 'COMMIT PHASE (Sincrona)' },
        style: { background: 'rgba(168, 85, 247, 0.1)', border: '2px dashed #a855f7', color: '#a855f7', fontWeight: 'bold', width: 220 },
    },
    {
        id: '5',
        type: 'unlockable',
        position: { x: 400, y: 880 },
        data: {
            label: 'Mutate Real DOM',
            description: 'React applica fisicamente le modifiche agli elementi HTML del browser.',
            type: 'commit',
            isLocked: true,
            onUnlock: () => { },
        },
    },
    {
        id: '6',
        type: 'unlockable',
        position: { x: 400, y: 1060 },
        data: {
            label: 'Browser Paint',
            description: 'Il browser visualizza i cambiamenti sullo schermo.',
            type: 'trigger',
            isLocked: true,
            onUnlock: () => { },
        },
    },

    // --- SIDE BRANCHES ---
    {
        id: '3b',
        type: 'unlockable',
        position: { x: 820, y: 600 }, // Pushed further for dynamic width
        data: {
            label: 'Bail-out',
            description: 'React nota che non ci sono cambiamenti e interrompe il lavoro qui.',
            type: 'trigger',
            isLocked: true,
            onUnlock: () => { },
        },
    },
    {
        id: '5b',
        type: 'unlockable',
        position: { x: -20, y: 1060 }, // Pushed further for dynamic width
        data: {
            label: 'useLayoutEffect (Opzionale)',
            description: 'Eseguito sincronicamente PRIMA del paint (può bloccare la UI).',
            type: 'reconciliation',
            isLocked: true,
            onUnlock: () => { },
        },
    },
    {
        id: '6b',
        type: 'unlockable',
        position: { x: 400, y: 1240 },
        data: {
            label: 'useEffect',
            description: 'Eseguito asincronicamente DOPO il paint (non blocca la UI).',
            type: 'trigger',
            isLocked: true,
            onUnlock: () => { },
        },
    },
];

interface MapViewerProps {
    isAllUnlocked: boolean;
}

export function MapViewer({ isAllUnlocked }: MapViewerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onUnlock = useCallback((id: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id && node.type === 'unlockable') {
                    return {
                        ...node,
                        data: { ...node.data as any, isLocked: false },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Update nodes with onUnlock callback
    const themedNodes: Node[] = useMemo(() => {
        return nodes.map(node => {
            if (node.type === 'unlockable') {
                return {
                    ...node,
                    data: {
                        ...node.data as any,
                        onUnlock,
                    }
                };
            }
            return node;
        });
    }, [nodes, onUnlock]);

    // Force global toggle synchronization
    useEffect(() => {
        setNodes((nds) =>
            nds.map(node => {
                if (node.type === 'unlockable' && node.id !== '1') {
                    return {
                        ...node,
                        data: {
                            ...node.data as any,
                            isLocked: !isAllUnlocked
                        }
                    };
                }
                return node;
            })
        );
    }, [isAllUnlocked, setNodes]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={themedNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultViewport={{ x: 100, y: 80, zoom: 1.1 }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="rgba(97, 218, 251, 0.1)"
                />
                <Controls
                    style={{
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '4px'
                    }}
                />
                <MiniMap
                    nodeColor={(n: any) => {
                        if (n.data?.isLocked) return '#1f2937';
                        if (n.id === '1') return '#61dafb';
                        if (['r-head', '2', '3', '4'].includes(n.id)) return '#61dafb';
                        if (n.id === '3b') return '#ef4444';
                        if (n.id === '5b') return '#fbbf24';
                        if (n.id === '6b') return '#10b981';
                        return '#a855f7';
                    }}
                    maskColor="rgba(0, 0, 0, 0.3)"
                    style={{
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px'
                    }}
                />
            </ReactFlow>
        </div>
    );
}
