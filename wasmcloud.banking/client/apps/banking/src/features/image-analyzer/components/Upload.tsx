import React, {useImperativeHandle} from 'react';
import {cn} from '@repo/ui/cn';
import {HTMLFileInputElement} from '@repo/ui/drag-and-drop/useDragging';

const Upload = React.forwardRef<
  HTMLInputElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLFileInputElement>
>(({className, ...props}, forwardedRef) => {
  const labelRef = React.useRef<HTMLLabelElement>(null);
  const inputRef = React.useRef<HTMLFileInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current!);

  const resetInput = () => {
    if (!inputRef.current) return;
    inputRef.current.value = '';
  };

  return (
    <label
      ref={labelRef}
      onClick={resetInput}
      className={cn(
        'block transition-colors bg-transparent hover:cursor-pointer',
        'rounded border-4 border-dashed border-foreground/20',
        'hover:border-foreground/40 hover:bg-foreground/5',
        className,
      )}
    >
      <input ref={inputRef} multiple={false} className="hidden" type="file" {...props} />
      <div className="p-4 text-center flex flex-col items-center justify-center h-full text-sm">
        <p>
          <span className="text-accent underline">Select a file from your device</span>
          <br />
          or drag and drop here
        </p>
      </div>
    </label>
  );
});

export {Upload};
