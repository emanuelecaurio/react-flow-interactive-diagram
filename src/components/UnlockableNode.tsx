import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Lock, Unlock, Cpu, Zap, Layers, RefreshCw } from 'lucide-react';

export type UnlockableNodeData = {
    label: string;
    description: string;
    type: 'trigger' | 'vdom' | 'reconciliation' | 'fiber' | 'commit';
    isLocked: boolean;
    onUnlock: (id: string) => void;
};

// Define the node type to be used with NodeProps
export type UnlockableNode = Node<UnlockableNodeData, 'unlockable'>;

const iconMap = {
    trigger: Zap,
    vdom: Layers,
    reconciliation: RefreshCw,
    fiber: Cpu,
    commit: Unlock,
};

export function UnlockableNode({ id, data }: NodeProps<UnlockableNode>) {
    const Icon = (iconMap as any)[data.type] || Cpu;

    return (
        <div
            className={`unlockable-node glass-morphism ${data.isLocked ? 'locked' : 'unlocked'}`}
            onClick={() => data.isLocked && data.onUnlock && data.onUnlock(id)}
        >
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

            {data.isLocked && (
                <div className="lock-overlay">
                    <div className="lock-icon-container">
                        <Lock size={20} className="lock-icon" />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Click to Reveal
                    </span>
                </div>
            )}

            <div className="node-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className="premium-gradient" style={{ padding: '6px', borderRadius: '6px' }}>
                        <Icon size={16} color="white" />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.label}</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    {data.description}
                </p>
            </div>

            {!data.isLocked && <div className="pulse-effect"></div>}

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
    );
}
