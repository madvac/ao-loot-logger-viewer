export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) {
    return 'n/a'
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)

  if (i === 0) {
    return `${bytes} ${sizes[i]})`
  }

  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

export function copyToClipboard(str) {
  const copyTextarea = document.createElement('textarea')

  copyTextarea.style.position = 'fixed'
  copyTextarea.style.opacity = '0'
  copyTextarea.textContent = str

  document.body.appendChild(copyTextarea)
  copyTextarea.select()
  document.execCommand('copy')
  document.body.removeChild(copyTextarea)
}
