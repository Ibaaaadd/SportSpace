export function createToastHelpers(toast: { push: (item: any) => void; dismiss: (id: string) => void }) {
  return {
    success: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'success' as const }),
    error: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'error' as const }),
    info: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'info' as const }),
    warning: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'warning' as const }),
  };
}
