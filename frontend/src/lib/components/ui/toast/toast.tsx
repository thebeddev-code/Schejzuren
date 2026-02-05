import { Toast, toaster } from "@kobalte/core/toast";
import { X } from "lucide-solid";
import { type Accessor, createMemo, type ParentProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Match, Show, Switch } from "solid-js/web";
import { cn } from "~/lib/utils/cn";

interface Props {
	className?: string;
	description?: string | JSX.Element;
	toastId: number;
	showProgress?: Accessor<boolean>;
}
function ToastBase({
	description,
	className,
	toastId,
	children,
	...props
}: Props & ParentProps) {
	return (
		<Toast
			toastId={toastId}
			class={cn(
				"flex flex-col gap-3 p-4 bg-linear-to-r from-white to-gray-50/50 border border-gray-200/50 shadow-lg rounded-lg backdrop-blur-sm",
				className,
			)}
		>
			{/* Header */}
			<div class="flex items-start w-full gap-3">
				<div class="flex-1 min-w-0">
					<Toast.Title class="font-semibold text-gray-900 text-base leading-tight truncate">
						{children}
					</Toast.Title>
					<Show when={description}>
						<Toast.Description class="text-sm text-gray-500 mt-1 leading-relaxed">
							{description}
						</Toast.Description>
					</Show>
				</div>
				<Toast.CloseButton class="group p-1.5 -m-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex-shrink-0">
					<X class="w-4 h-4" />
				</Toast.CloseButton>
			</div>

			{/* Progress */}
			<Show when={props.showProgress?.()}>
				<Toast.ProgressTrack class="h-1.5 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
					<Toast.ProgressFill
						class="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-sm
          transition-all duration-200 ease-linear w-(--kb-toast-progress-fill-width)"
					/>
				</Toast.ProgressTrack>
			</Show>
		</Toast>
	);
}

function show(
	message: JSX.Element | string,
	description: JSX.Element | string,
) {
	return toaster.show((props) => (
		<ToastBase toastId={props.toastId} description={description}>
			{message}
		</ToastBase>
	));
}

function success(message: string) {
	return toaster.show((props) => (
		<Toast
			toastId={props.toastId}
			class="flex flex-col items-center justify-between gap-2 border-2 border-gray-600 rounded-sm p-3 bg-white shadow-sm toast--success"
		>
			{message}
		</Toast>
	));
}
function error(message: string) {
	return toaster.show((props) => (
		<Toast
			toastId={props.toastId}
			class="flex flex-col items-center justify-between gap-2 border-2 border-gray-600 rounded-sm p-3 bg-white shadow-sm toast--error"
		>
			{message}
		</Toast>
	));
}
function promise<T, U>(
	promise: Promise<T> | (() => Promise<T>),
	options: {
		loading?: JSX.Element | string;
		success?: string | ((data: T) => JSX.Element);
		error?: string | ((error: U) => JSX.Element);
	},
) {
	return toaster.promise(promise, (props) => (
		<ToastBase
			toastId={props.toastId}
			class={cn({
				"toast-loading": props.state === "pending",
				"toast-success": props.state === "fulfilled",
				"toast-error": props.state === "rejected",
			})}
			showProgress={createMemo(
				() => props.state === "fulfilled" || props.state === "rejected",
			)}
		>
			<Switch>
				<Match when={props.state === "pending"}>{options.loading}</Match>
				<Match when={props.state === "fulfilled"}>
					{typeof options.success === "string"
						? options.success
						: options.success?.(props.data)}
				</Match>
				<Match when={props.state === "rejected"}>
					{typeof options.error === "string"
						? options.error
						: options.error?.(props.error)}
				</Match>
			</Switch>
		</ToastBase>
	));
}
function custom(jsx: () => JSX.Element) {
	return toaster.show((props) => <Toast toastId={props.toastId}>{jsx}</Toast>);
}
function dismiss(id: number) {
	return toaster.dismiss(id);
}
export const toast = {
	show,
	success,
	error,
	promise,
	custom,
	dismiss,
};
