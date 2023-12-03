"use client";
import { Box, Button, Flex, ScrollArea, Table, Tabs, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

const PIE_TABS = [
    "ALL",
    "Positive",
    "Negative"
];

const ImageGallery = () => {
    return (
        <Box className="w-1/2">
            <Flex direction="row" gap="2">
                <Flex direction="column" gap="2" >
                    {
                        Array.from({ length: 7 }, (_, i) => i + 1).map((_, i) => (
                            <img src={"https://picsum.photos/65/" + (65 + i)} width="65" height="65" key={i} />
                        ))
                    }
                </Flex >
                <img src="https://picsum.photos/500/500" width="500" height="500" />
            </Flex>
        </Box>
    )
}

const RADIAN = Math.PI / 180;
export default function Home() {
    const [currentCategory, setCurrentCategory] = useState("");
    const [hoverCategory, setHoverCategory] = useState("");
    const [selectedReviewTopic, setSelectedReviewTopic] = useState("");
    const [selectedTab, setSelectedTab] = useState(PIE_TABS[0]);
    const [filteredProduct, setFilteredProduct] = useState(null);

    const [PRODUCT, setPRODUCT] = useState(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        var productId = params.get('productId');
        fetch("https://def3-192-33-206-199.ngrok-free.app/api/product/" + productId, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setPRODUCT(data);
            });
    }, []);

    useEffect(() => {
        setCurrentCategory("");
        setSelectedReviewTopic("");
    }, [selectedTab]);

    useEffect(() => {
        if (PRODUCT) {
            //@ts-ignore
            const filteredReviewProduct = PRODUCT.categories.map((category) => ({ ...category, clusters: category.clusters.map((cluster) => ({ ...cluster, reviews: cluster.reviews.filter((review) => selectedTab === "ALL" || (selectedTab === "Positive" && review.sentiment > 0.0) || (selectedTab === "Negative" && review.sentiment < 0.0)) })) }));
            const filteredReviewProductWithoutEmptyClusters = filteredReviewProduct.map((category) => ({ ...category, clusters: category.clusters.filter((cluster) => cluster.reviews.length > 0) }));
            const filteredReviewProductWithoutEmptyCategories = filteredReviewProductWithoutEmptyClusters.filter((category) => category.clusters.length > 0);
            const filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentiment = filteredReviewProductWithoutEmptyCategories.map((category) => ({ ...category, clusters: category.clusters.map((cluster) => ({ ...cluster, clusterSentiment: cluster.reviews.reduce((acc, review) => acc + parseFloat(review.sentiment), 0) / cluster.reviews.length })) }));
            const filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentiment = filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentiment.map((category) => ({ ...category, categorySentiment: category.clusters.reduce((acc, cluster) => acc + parseFloat(cluster.clusterSentiment), 0) / category.clusters.length }));
            //            const filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentimentAndProductSentiment = { ...filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentiment, productSentiment: filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentiment.reduce((acc, category) => acc + parseFloat(category.categorySentiment), 0) / filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentiment.length };
            setFilteredProduct(filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentiment);
            //            console.log(filteredReviewProductWithoutEmptyCategoriesAndClustersWithClusterSentimentandCategoriesSentimentAndProductSentiment);
            //            setFilteredProduct(filteredReviewProduct.filter((cluster) => selectedTab === "ALL" || (selectedTab === "Positive" && cluster.clusterSentiment > 0.0) || (selectedTab === "Negative" && cluster.clusterSentiment <= 0.0)));
        }
    }, [PRODUCT, selectedTab]);

    useEffect(() => {
        console.log(filteredProduct);
        console.log(PRODUCT);
    }, [filteredProduct])

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.60;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <>
                <text x={x} y={y} fill="black" className="pointer-events-none" textAnchor='middle' dominantBaseline="central">
                    {filteredProduct[index].categoryID}
                </text><br />
                <text x={x} y={y + 15} fill="black" className="pointer-events-none" textAnchor='middle' dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                </text >
            </>
        );
    };

    return (
        <Flex direction="column" gap="2">
            <Box px="4" className="border-b border-gray-800">
                <Flex direction="row" gap="2">
                    <Text size="6" weight="bold">Reviews</Text>
                </Flex>
            </Box>
            {PRODUCT ? (
                <Box p="4">
                    <Flex direction="column" gap="2">
                        <Text size="6" weight="bold">{PRODUCT.productName}</Text>
                        <Flex direction="row" gap="2">
                            <ImageGallery />
                            <Tabs.Root defaultValue="ALL" className="w-full ps-10">
                                <Tabs.List>
                                    {PIE_TABS.map((tab) => (
                                        <Tabs.Trigger value={tab} key={tab} onClick={() => setSelectedTab(tab)}>
                                            {tab}
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>
                                <Box px="2" pt="2" pb="2">
                                    {(filteredProduct && filteredProduct.length > 0) ? (
                                        <Flex direction="row" gap="2">
                                            <Box style={{ width: 500, height: 500 }} className="w-full">
                                                <PieChart width={500} height={500}>
                                                    <Pie
                                                        isAnimationActive={false} cx={250} cy={250} outerRadius={220}
                                                        labelLine={false}
                                                        dataKey="value"
                                                        data={filteredProduct.map((category) => ({ name: category.categoryID, value: category.categorySentiment + 1.0 }))}
                                                        label={renderCustomizedLabel}
                                                        fill="#8884d8">
                                                        {filteredProduct.map((category, index) => (
                                                            <Cell key={`cell-${index}`} fill={"hsl(" + ((category.categorySentiment + 1) * 60.0) + ", 100%, 50%)"} onClick={() => { setCurrentCategory(category.categoryID); setSelectedReviewTopic("") }} onMouseEnter={() => setHoverCategory(category.categoryID)} onMouseLeave={() => setHoverCategory("")} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </Box>
                                            <Box className="w-full">
                                                <Flex direction="column" gap="2">
                                                    {currentCategory !== "" ? (
                                                        <ScrollArea className="w-full" style={{ height: 500 }}>
                                                            <Table.Root>
                                                                <Table.Header>
                                                                    <Table.Row>
                                                                        <Table.ColumnHeaderCell>Most Reoccurring for {currentCategory}</Table.ColumnHeaderCell>
                                                                        <Table.ColumnHeaderCell />
                                                                    </Table.Row>
                                                                </Table.Header>

                                                                <Table.Body>
                                                                    {filteredProduct[filteredProduct.findIndex((category) => category.categoryID === currentCategory)].clusters.map((cluster: any) => (
                                                                        //.most_reoccurring.map((word: any) => (
                                                                        <Table.Row key={cluster.clusterID}>
                                                                            <Table.Cell>{cluster.clusterInterpret}</Table.Cell>
                                                                            <Table.Cell className="text-right">
                                                                                <Button onClick={() => setSelectedReviewTopic(cluster.clusterID)}>
                                                                                    Details
                                                                                </Button>
                                                                            </Table.Cell>
                                                                        </Table.Row>
                                                                    ))}
                                                                </Table.Body>
                                                            </Table.Root>
                                                        </ScrollArea>
                                                    ) : (
                                                        <Box className="w-full flex items-center justify-center" style={{ height: 500 }}>
                                                            <Text size="3" weight="bold" align="center" className="text-gray-500">
                                                                Select a category for a breakdown of reviews
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </Flex>
                                            </Box>
                                        </Flex>
                                    ) : (
                                        <Text size="6" weight="bold">No {selectedTab.toLocaleLowerCase()} reviews</Text>
                                    )}
                                    {selectedReviewTopic !== "" && (
                                        <Table.Root>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.ColumnHeaderCell>Reviews for {filteredProduct[filteredProduct.findIndex((category) => category.categoryID === currentCategory)].clusters.filter((cluster) => cluster.clusterID === selectedReviewTopic)[0].clusterInterpret}</Table.ColumnHeaderCell>
                                                    <Table.ColumnHeaderCell className="text-right" >Sentiment</Table.ColumnHeaderCell>
                                                </Table.Row>
                                            </Table.Header>

                                            <Table.Body>
                                                {filteredProduct[filteredProduct.findIndex((category) => category.categoryID === currentCategory)].clusters.filter((cluster) => cluster.clusterID === selectedReviewTopic)[0].reviews.map((review) => (
                                                    <Table.Row key={"review-" + review.Reviews + Math.random()}>
                                                        <Table.Cell>{review.Reviews}</Table.Cell>
                                                        <Table.Cell className="text-right">{review.sentiment}</Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table.Root>
                                    )}
                                </Box>
                            </Tabs.Root>
                        </Flex>
                    </Flex >
                </Box >
            ) : (
                <Box p="4">
                    <Text size="6" weight="bold">Loading...</Text>
                </Box>
            )}
        </Flex >
    )
}
