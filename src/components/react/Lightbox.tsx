import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface OpenImage {
  src: string;
  alt: string;
}

export function Lightbox() {
  const [image, setImage] = useState<OpenImage | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement>('.prose-case img');

    function open(this: HTMLImageElement) {
      triggerRef.current = this;
      setImage({ src: this.currentSrc || this.src, alt: this.alt });
    }

    function onKeyDown(this: HTMLImageElement, event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open.call(this);
      }
    }

    images.forEach((img) => {
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', open);
      img.addEventListener('keydown', onKeyDown);
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', open);
        img.removeEventListener('keydown', onKeyDown);
      });
    };
  }, []);

  function onOpenChange(next: boolean) {
    if (!next) setImage(null);
  }

  return (
    // Обёртка нужна всегда, даже когда диалог закрыт и Radix ничего не рендерит:
    // client:visible следит через IntersectionObserver за дочерними узлами
    // острова, и без постоянного узла-хоста ему не за что зацепиться — остров
    // никогда бы не гидратировался.
    <div>
      <Dialog open={image !== null} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[95vw] p-2 sm:max-w-5xl"
          onCloseAutoFocus={(event) => {
            // Фокусом на закрытии управляем сами (возврат на изображение-триггер).
            // Без Dialog.Trigger радиксу не на что опереться при автоматическом
            // восстановлении фокуса, и он уводит его на <body> — перехватываем.
            // Focus-scope диалога снимает "ловушку" только на этом шаге, поэтому
            // именно здесь (а не раньше, в onOpenChange) вызов focus() не будет
            // немедленно возвращён обратно внутрь диалога.
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">{image?.alt ?? 'Изображение из кейса'}</DialogTitle>
          {image && (
            <img src={image.src} alt={image.alt} className="max-h-[85vh] w-full rounded object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
