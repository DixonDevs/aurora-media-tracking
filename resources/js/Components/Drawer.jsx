import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';

export default function Drawer({
    children,
    show = false,
    title = '',
    onClose = () => { },
    closeable = true,
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="absolute inset-0 bg-gray-500/75"
                        aria-hidden="true"
                        onClick={close}
                    />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="ease-in duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                                className="pointer-events-auto w-screen max-w-xs"
                            >
                                <DialogPanel className="flex h-full flex-col bg-white shadow-xl">
                                    {title && (
                                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {title}
                                            </h2>
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto px-6 py-4">
                                        {children}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
