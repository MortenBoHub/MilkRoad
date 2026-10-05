import {useEffect, useState} from "react";
import type {Products} from "@/api/Api.ts";
import {Api} from "@/api/Api.ts";


export function ProductList() {
    const [product, setProduct] = useState<Products[]>([])

    useEffect(() => {
        const api = new Api();

        api.api.productGetAll()
            .then((res) => {
                setProduct(res);
            })
            .catch((err) => {
                console.error("Failed to load products", err);
            });
    }, []);

    return<div className="container">
        {product.map(p => (
            <div key={p.id}>
                <h3>{p.productName}</h3>
                <p>Price: {p.price}</p>
            </div>
        ))}
    </div>
}