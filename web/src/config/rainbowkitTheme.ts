import { getCssVar } from '@/lib/helpers';
import { type Theme } from '@rainbow-me/rainbowkit';

export function getRainbowKitTheme(): Theme {
    return {
        blurs: {
            modalOverlay: 'blur(8px)',
        },
        colors: {
            accentColor: getCssVar('--primary', '#8A42FF'),
            accentColorForeground: getCssVar('--primary-foreground', '#FFFFFF'),
            actionButtonBorder: getCssVar('--border', '#3e3e5e'),
            actionButtonBorderMobile: getCssVar('--border', '#3e3e5e'),
            actionButtonSecondaryBackground: getCssVar('--popover', '#292A3D'),
            closeButton: getCssVar('--foreground', '#FFFFFF'),
            closeButtonBackground: getCssVar('--input', '#3e3e5e'),
            connectButtonBackground: getCssVar('--card', '#1d1e2c'),
            connectButtonBackgroundError: getCssVar('--destructive', 'oklch(0.704 0.191 22.216)'),
            connectButtonInnerBackground: getCssVar('--card', '#1d1e2c'),
            connectButtonText: getCssVar('--foreground', '#FFFFFF'),
            connectButtonTextError: getCssVar('--foreground', '#FFFFFF'),
            connectionIndicator: getCssVar('--ring', '#8A42FF'),
            downloadBottomCardBackground: getCssVar('--card', '#1d1e2c'),
            downloadTopCardBackground: getCssVar('--popover', '#292A3D'),
            error: getCssVar('--destructive', 'oklch(0.704 0.191 22.216)'),
            generalBorder: getCssVar('--border', '#3e3e5e'),
            generalBorderDim: getCssVar('--border', '#3e3e5e'),
            menuItemBackground: getCssVar('--popover', '#292A3D'),
            modalBackdrop: 'rgba(0, 0, 0, 0.6)',
            modalBackground: getCssVar('--card', '#1d1e2c'),
            modalBorder: getCssVar('--border', '#3e3e5e'),
            modalText: getCssVar('--foreground', '#FFFFFF'),
            modalTextDim: getCssVar('--muted-foreground', '#8F90A6'),
            modalTextSecondary: getCssVar('--secondary', '#D93B93'),
            profileAction: getCssVar('--accent', '#D93B93'),
            profileActionHover: getCssVar('--primary', '#8A42FF'),
            profileForeground: getCssVar('--foreground', '#FFFFFF'),
            selectedOptionBorder: getCssVar('--ring', '#8A42FF'),
            standby: getCssVar('--accent', '#D93B93'),
        },
        fonts: {
            body: 'Inter, sans-serif',
        },
        radii: {
            actionButton: '12px',
            connectButton: '12px',
            menuButton: '12px',
            modal: '16px',
            modalMobile: '16px',
        },
        shadows: {
            connectButton: `0 0 0 1px ${getCssVar('--primary', '#8A42FF')}`,
            dialog: '0 10px 40px rgba(0,0,0,0.6)',
            profileDetailsAction: `0 0 0 1px ${getCssVar('--accent', '#D93B93')}`,
            selectedOption: `0 0 0 1px ${getCssVar('--ring', '#8A42FF')}`,
            selectedWallet: `0 0 0 2px ${getCssVar('--ring', '#8A42FF')}`,
            walletLogo: `0 0 0 1px ${getCssVar('--border', '#3e3e5e')}`,
        },
    };
}
