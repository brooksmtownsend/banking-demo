import {useTheme} from '@repo/ui/theme/useTheme';
import React, {ComponentProps, HTMLProps, useImperativeHandle} from 'react';
import ReactGlobeGL from 'react-globe.gl';
import earthDark from '@/features/globe/assets/earth-dark.jpg';
import earthLight from '@/features/globe/assets/earth-light.jpg';
import nightSky from '@/features/globe/assets/night-sky.png';
import daySky from '@/features/globe/assets/day-sky.png';
import {cn} from '@repo/ui/cn';
import {useObjectProps} from '@/features/globe/hooks/useObjectProps';
import {useCableProps} from '@/features/globe/hooks/useCableProps';

type GlobeMethods = ComponentProps<typeof ReactGlobeGL>['ref'] extends
  | React.MutableRefObject<infer T>
  | undefined
  ? Exclude<T, undefined>
  : never;

const DEFAULT_COLOR = 'rgba(0,0,0,1)';

function getColor(cssVar: string, alpha = 1) {
  const tempEl = document.createElement('div');
  tempEl.style.color = `hsl(var(${cssVar}))`;
  document.body.append(tempEl);

  const regex = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.eE+-]+)?\s*\)$/;
  const val = window.getComputedStyle(tempEl).color || DEFAULT_COLOR;
  const [, r, g, b] = [...(val.match(regex) ?? ['', 0, 0, 0])].map(Number);
  tempEl.remove();
  return !!r && !!g && !!b ? `rgba(${r},${g},${b},${alpha})` : undefined;
}

const Globe = React.forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({className, ...props}, ref) => {
    const [theme] = useTheme();
    const [colors, setColors] = React.useState({
      success: DEFAULT_COLOR,
      accent: DEFAULT_COLOR,
      danger: DEFAULT_COLOR,
      foreground: DEFAULT_COLOR,
    });

    const globeImageUrl = theme === 'dark' ? earthDark : earthLight;
    const backgroundImageUrl = theme === 'dark' ? nightSky : daySky;

    const globeEl = React.useRef<GlobeMethods>();
    const container = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => container.current!);
    const inner = React.useRef<HTMLDivElement>(null);
    const [{width, height}, setSize] = React.useState({width: 0, height: 0});

    React.useEffect(() => {
      if (!container.current) return;

      setColors({
        success: getColor('--ui-color-success') || DEFAULT_COLOR,
        accent: getColor('--ui-color-accent') || '#007038',
        danger: getColor('--ui-color-danger') || '#bd1000',
        foreground: getColor('--ui-color-foreground', 0.3) || DEFAULT_COLOR,
      });
    }, [theme]);

    React.useEffect(() => {
      if (!container.current) return;

      const containerEl = container.current;
      const updateSize = () => {
        const {width, height} = containerEl.getBoundingClientRect();
        setSize({width, height});
      };

      window.addEventListener('resize', updateSize);
      updateSize();

      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }, []);

    React.useEffect(() => {
      const globe = globeEl.current;
      if (!globe) return;

      const params = new URLSearchParams(window.location.search);

      // Get Lat/Lng from URL or default to USA
      const lat = Number(params.get('lat')) || 39.8283;
      const lng = Number(params.get('lng')) || -98.5795;

      globe.pointOfView({lat, lng}, 3000);
    }, []);

    const cableProps = useCableProps({
      color: colors.foreground,
    });
    const objectProps = useObjectProps({
      region: {color: colors.accent, radius: 1, altitude: 0.006},
      edgeZone: {color: colors.foreground, radius: 0.6, altitude: 0.004},
      pop: {color: colors.foreground, radius: 0.3, altitude: 0.002},
      pin: {color: colors.success, radius: 0.3, altitude: 0.05},
    });

    return (
      <div ref={container} className={cn('grow h-full', className)} {...props}>
        <div ref={inner}>
          {/* @ts-expect-error -- the reactglobe.gl types are horribly incorrect */}
          <ReactGlobeGL
            ref={globeEl}
            globeImageUrl={globeImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            width={width}
            height={height}
            {...cableProps}
            {...objectProps}
          />
        </div>
      </div>
    );
  },
);

export {Globe};
