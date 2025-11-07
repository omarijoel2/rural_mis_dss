<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Rural Water Supply MIS API",
 *     description="Management Information System and Decision Support System for Rural Water Infrastructure with GIS capabilities, multi-tenancy, and RBAC.",
 *     @OA\Contact(
 *         email="api@ruralwater.mis"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:5000/api",
 *     description="Development API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Laravel Sanctum token authentication"
 * )
 * 
 * @OA\Tag(
 *     name="Schemes",
 *     description="Water supply schemes management"
 * )
 * 
 * @OA\Tag(
 *     name="DMAs",
 *     description="District Metered Areas management"
 * )
 * 
 * @OA\Tag(
 *     name="Facilities",
 *     description="Water facilities (treatment plants, tanks, pumps) management"
 * )
 * 
 * @OA\Tag(
 *     name="GIS",
 *     description="Spatial data import/export operations"
 * )
 * 
 * @OA\Tag(
 *     name="Auth",
 *     description="Authentication and authorization"
 * )
 */
class OpenApiController extends Controller
{
    // This class only serves as OpenAPI documentation container
}
