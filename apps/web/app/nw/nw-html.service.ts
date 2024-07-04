import { DOCUMENT } from "@angular/common"
import { Injectable, SecurityContext, inject } from "@angular/core"
import { DomSanitizer } from "@angular/platform-browser"
import { environment } from "apps/web/environments"

@Injectable({ providedIn: 'root' })
export class NwHtmlService {
  private sanitizer = inject(DomSanitizer)
  private doc = inject(DOCUMENT)
  private el = this.doc.createElement('div')

  public sanitize(value: string) {
    this.el.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, value)
    updateNwHtml(this.el)
    return this.el.innerHTML
  }
}

function updateNwHtml(el: HTMLElement) {
  el.querySelectorAll('img').forEach((img) => {
    img.classList.add('inline')
    let src = img.getAttribute('src') || ''
    if (src.match(/lyshineui[\\/]images/i)) {
      src = environment.cdnDataUrl + '/' + src
      src = src.replace(/\.(png|jpg|jpeg|dds|tga)$/i, '')
      src = src + '.webp'
      src = src.toLowerCase()
      img.classList.add('nw-icon')
      img.setAttribute('src', src)
    }
  })
  el.querySelectorAll('font').forEach((font) => {
    const face = font.getAttribute('face') || ''
    font.removeAttribute('face')
    if (face.match(/caslonant/i)) {
      font.classList.add('font-caslon')
    }
    if (face.match(/nimbus_/i)) {
      font.classList.add('font-nimbus')
    }
    if (face.match(/pica_/i)) {
      // font.classList.add('')
    }
    if (face.match(/_regular/i)) {
      font.classList.add('font-normal')
    }
    if (face.match(/_medium/i)) {
      font.classList.add('font-medium')
    }
    if (face.match(/_semibold/i)) {
      font.classList.add('font-semibold')
    }
    if (face.match(/_bold/i)) {
      font.classList.add('font-bold')
    }
    if (face.match(/_italic/i)) {
      font.classList.add('italic')
    }
  })
}
