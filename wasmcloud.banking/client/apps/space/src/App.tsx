import {Navbar} from '@/layout/Navbar';
import {Globe} from '@/features/globe/components/Globe';
import {ImageAnalyzer} from '@/features/image-analyzer/components/ImageAnalyzer';

function App() {
  return (
    <>
      <div className="relative flex flex-col justify-start align-middle min-h-full">
        <div className="z-10 grow flex flex-col w-full pointer-events-none">
          <Navbar className="z-10 pointer-events-auto" />

          <div className="grow flex p-4 gap-8 items-start max-w-screen-2xl mx-auto w-full">
            <ImageAnalyzer className="z-10 pointer-events-auto" />
            <div className="h-full w-full block" />
          </div>
        </div>
        <div className="fixed overflow-hidden h-full w-full z-0">
          <Globe />
        </div>
      </div>
    </>
  );
}

export default App;
