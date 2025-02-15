import {useEffect, useRef, useState} from "react";

let allTabs = [
    {
        id: "home",
        name: "Home",
    },
    {
        id: "blog",
        name: "Blog",
    },
    {
        id: "projects",
        name: "Projects",
    },
    {
        id: "arts",
        name: "Arts",
    },
];

export const SlidingTabBar = () => {
    const tabsRef = useRef<(HTMLElement | null)[]>([]);
    const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);
    const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
    const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

    useEffect(() => {
        if (activeTabIndex === null) {
            return;
        }

        const setTabPosition = () => {
            const currentTab = tabsRef.current[activeTabIndex] as HTMLElement;
            setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
            setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
        };

        setTabPosition();
    }, [activeTabIndex]);

    return (
        <div className="flew-row relative mx-auto flex h-12 rounded-3xl border border-black/40 bg-neutral-800 px-2 backdrop-blur-sm">
      <span
          className="absolute bottom-0 top-0 -z-10 flex overflow-hidden rounded-3xl py-2 transition-all duration-300"
          style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
      >
        <span className="h-full w-full rounded-3xl bg-gray-200/30" />
      </span>
            {allTabs.map((tab, index) => {
                const isActive = activeTabIndex === index;

                return (
                    <button
                        key={index}
                        ref={(el) => (tabsRef.current[index] = el)}
                        className={`${
                            isActive ? `` : `hover:text-neutral-300`
                        } my-auto cursor-pointer select-none rounded-full px-4 text-center font-light text-white`}
                        onClick={() => setActiveTabIndex(index)}
                    >
                        {tab.name}
                    </button>
                );
            })}
        </div>
    );
};
